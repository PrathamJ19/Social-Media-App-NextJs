const fs = require('fs');
const path = require('path');
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
});

// Import and use routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');  // Correctly import the posts route
const searchRoutes = require('./routes/search');  // Add this line
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);  // Correctly use the posts route
app.use('/api/search', searchRoutes);  // Add this line
app.use('/api/chat', chatRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
