const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { content } = req.body;
  try {
    const post = new Post({ userId: req.user.id, content });
    await post.save();
    res.status(201).send(post);
  } catch (err) {
    res.status(400).send('Error creating post');
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('userId', 'username isPrivate').sort({ createdAt: -1 });
    res.send(posts);
  } catch (err) {
    res.status(400).send('Error fetching posts');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'username isPrivate');
    if (!post) return res.status(404).send('Post not found');
    res.send(post);
  } catch (err) {
    res.status(400).send('Error fetching post');
  }
});

module.exports = router;
