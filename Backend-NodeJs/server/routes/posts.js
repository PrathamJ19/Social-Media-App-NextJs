// server/routes/Post.js
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const s3 = require('../aws-config'); // Import the configured S3 instance

const router = express.Router();

// Configure multer for file uploads to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

router.post('/create', authMiddleware, upload.array('images', 3), async (req, res) => {
  const { content } = req.body;
  let images = [];

  if (req.files && req.files.length > 0) {
    images = req.files.map(file => file.location);
  }

  try {
    const newPost = new Post({
      author: req.user.id,
      content,
      images,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username profilePicture').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: err.message });
  }
});


router.put('/:postId', authMiddleware, upload.array('images', 3), async (req, res) => {
  const { content, removedImages } = req.body;
  let images = [];

  // Add newly uploaded images
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => file.location);
  }

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update content
    post.content = content || post.content;

    // Remove specified images
    if (removedImages && removedImages.length > 0) {
      const removedImagesArray = Array.isArray(removedImages) ? removedImages : [removedImages];
      post.images = post.images.filter((image) => !removedImagesArray.includes(image));
    }

    // Add new images to the existing list
    post.images = [...post.images, ...images];

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.post('/like/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const currentUsername = req.user.username;

    if (post.likes.includes(currentUsername)) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    post.likes.push(currentUsername);
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/unlike/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const currentUsername = req.user.username;

    if (!post.likes.includes(currentUsername)) {
      return res.status(400).json({ message: 'You have not liked this post' });
    }

    post.likes = post.likes.filter(username => username !== currentUsername);
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:postId/comments', authMiddleware, async (req, res) => {
  const { content } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      author: req.user.id,
      content,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the comments' author field
    const populatedPost = await Post.findById(req.params.postId)
      .populate({
        path: 'comments.author',
        select: 'username'
      });

    const newCommentWithAuthor = populatedPost.comments[populatedPost.comments.length - 1];
    res.status(201).json(newCommentWithAuthor);
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:username', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }); // Now User will be recognized
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ author: user._id }).populate('author', 'username profilePicture').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
