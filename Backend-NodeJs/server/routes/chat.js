const express = require('express');
const { StreamChat } = require('stream-chat');
const authMiddleware = require('../middleware/authMiddleware'); // Use the existing middleware
const User = require('../models/User');
const router = express.Router();

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// Generate a Stream Chat token for the authenticated user
router.post('/generate-token', authMiddleware, (req, res) => {
  try {
    const userId = req.user._id; // Make sure `_id` is properly assigned
    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing' });
    }

    const token = serverClient.createToken(userId.toString());
    res.status(200).json({ token, userId: userId.toString() }); // Ensure userId is sent back as a string
  } catch (error) {
    console.error('Error generating token:', error.message);
    res.status(500).json({ error: 'Failed to generate Stream Chat token' });
  }
});


// Fetch user details for Stream Chat (e.g., username, profile picture)
router.get('/user', authMiddleware, (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      id: user._id, // MongoDB user ID
      username: user.username, // User's name
      profilePicture: user.profilePicture, // Profile picture URL
    });
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

router.post('/create-user', authMiddleware, async (req, res) => {
  try {
    const { userId, username, profilePicture } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'User ID and username are required' });
    }

    // Upsert user into Stream Chat
    await serverClient.upsertUser({
      id: userId,
      name: username,
      image: profilePicture,
    });

    res.status(200).json({ message: 'User ensured in Stream Chat' });
  } catch (error) {
    console.error('Error creating/updating user:', error.message);
    res.status(500).json({ error: 'Failed to ensure user in Stream Chat' });
  }
});

// routes/chat.js
router.post('/create-channel', authMiddleware, async (req, res) => {
  try {
    let { channelName, members } = req.body;

    if (!channelName || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Channel name and members are required' });
    }

    // Sort members to ensure consistency
    members.sort();

    // Fetch user details from the database for all members
    const users = await User.find({ username: { $in: members } });
    if (users.length !== members.length) {
      return res.status(404).json({ error: 'One or more users not found' });
    }

    // Prepare user data for upserting
    const streamUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.username,
      image: user.profilePicture,
    }));

    // Upsert users into Stream Chat
    await serverClient.upsertUsers(streamUsers);

    // Get the authenticated user's ID
    const creatorId = req.user._id.toString();

    // Create the channel with 'created_by_id'
    const channel = serverClient.channel('messaging', channelName, {
      members: streamUsers.map(u => u.id),
      created_by_id: creatorId, // Include this line
    });

    await channel.create();

    res.status(200).json({ message: 'Channel created', channelId: channel.id });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel', details: error.message });
  }
});


module.exports = router;
