const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find({ username: { $regex: query, $options: 'i' } }).select('username profilePicture');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error searching users:', err); // Log the error for debugging
    res.status(500).json({ message: 'Error searching users' });
  }
});

module.exports = router;
