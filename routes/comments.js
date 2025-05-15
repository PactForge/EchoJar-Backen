const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const filter = require('../utils/profanityFilter');

router.post('/:postId', auth, async (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;
  const userId = req.user.id;
  try {
    const post = await Post.findById(postId).populate('userId');
    if (!post) return res.status(404).send('Post not found');

    if (post.userId.isPrivate && !req.user.isAdmin) {
      return res.status(403).send('Only admin can comment on private posts');
    }

    if (filter.isProfane(content)) {
      return res.status(400).send('Comment contains profanity');
    }

    const comment = new Comment({ postId, userId, content });
    await comment.save();
    res.status(201).send(comment);
  } catch (err) {
    res.status(400).send('Error posting comment');
  }
});

router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.send(comments);
  } catch (err) {
    res.status(400).send('Error fetching comments');
  }
});

module.exports = router;
