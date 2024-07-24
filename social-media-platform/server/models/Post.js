// server/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 200 },
    images: [String],
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: String }] // Array of usernames who liked the post
  });
  

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
