const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { uploadToS3 } = require('../s3-utils');
const Post = require('../models/Post'); 
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const s3 = require('../aws-config'); // Import the configured S3 instance

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

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

router.post('/signup', upload.single('profilePicture'), async (req, res) => {
  const { username, email, password } = req.body;
  let profilePicture = 'default-profile-pic.jpg';

  if (req.file) {
    try {
      profilePicture = req.file.location; // Get the location of the uploaded file
    } catch (err) {
      return res.status(500).json({ message: 'Error uploading profile picture to S3' });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving
    const newUser = new User({ username, email, password: hashedPassword, profilePicture });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(201).json({ username: newUser.username, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', username: user.username, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/profile/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).populate('followers following', 'username');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      username: user.username,
      profilePicture: user.profilePicture,
      followers: user.followers.length,
      following: user.following.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/is-following/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;
  const currentUser = req.user.id;

  try {
    const userToCheck = await User.findOne({ username });
    if (!userToCheck) return res.status(404).json({ message: 'User not found' });

    const isFollowing = userToCheck.followers.includes(currentUser);
    res.status(200).json({ isFollowing });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/follow/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;
  const currentUser = req.user.id;

  try {
    const userToFollow = await User.findOne({ username });
    if (!userToFollow) return res.status(404).json({ message: 'User not found' });

    if (userToFollow.followers.includes(currentUser)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    userToFollow.followers.push(currentUser);
    await userToFollow.save();

    const currentUserDoc = await User.findById(currentUser);
    currentUserDoc.following.push(userToFollow._id);
    await currentUserDoc.save();

    res.status(200).json({ message: 'Now following user', username });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/unfollow/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;
  const currentUser = req.user.id;

  try {
    const userToUnfollow = await User.findOne({ username });
    if (!userToUnfollow) return res.status(404).json({ message: 'User not found' });

    if (!userToUnfollow.followers.includes(currentUser)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(follower => follower.toString() !== currentUser);
    await userToUnfollow.save();

    const currentUserDoc = await User.findById(currentUser);
    currentUserDoc.following = currentUserDoc.following.filter(following => following.toString() !== userToUnfollow._id);
    await currentUserDoc.save();

    res.status(200).json({ message: 'Unfollowed user', username });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/create', authMiddleware, upload.array('images', 3), async (req, res) => {
    console.log('Request received:', req.body, req.files); // Log the request body and files

    const { content } = req.body;
    let images = [];

    if (req.files && req.files.length > 0) {
        try {
            images = req.files.map(file => file.location); // Use the S3 URL directly
            console.log('Images uploaded to S3:', images); // Log the uploaded images URLs
        } catch (err) {
            console.error('Error uploading images to S3:', err); // Log the error
            return res.status(500).json({ message: 'Error uploading images to S3' });
        }
    }

    try {
        const newPost = new Post({
            author: req.user.id,
            content,
            images,
        });
        await newPost.save();
        console.log('Post created successfully:', newPost); // Log the newly created post
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating post:', err); // Log the error
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

router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
