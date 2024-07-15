// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/signup', upload.single('profilePicture'), async (req, res) => {
  const { username, email, password } = req.body;
  const profilePicture = req.file ? req.file.path.replace(/\\/g, '/') : 'uploads/default-profile-pic.jpg';

  try {
    const newUser = new User({ username, email, password, profilePicture });
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
  const currentUser = req.user.id; // Ensure this is the correct field

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
  const currentUser = req.user.id; // Ensure this is the correct field

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
  const currentUser = req.user.id; // Ensure this is the correct field

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

module.exports = router;
