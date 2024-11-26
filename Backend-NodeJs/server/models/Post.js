// server/models/Post.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 200 },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: String }], // Array of usernames who liked the post
  comments: [commentSchema], // Array of comments
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
