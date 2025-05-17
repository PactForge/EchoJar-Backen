```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username' },
      });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username' },
      });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const post = new Post({
      content: req.body.content,
      user: req.user.userId,
    });

    await post.save();
    await post.populate('user', 'username');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const comment = new Comment({
      content: req.body.content,
      user: req.user.userId,
      post: req.params.id,
    });

    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    await comment.populate('user', 'username');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```
