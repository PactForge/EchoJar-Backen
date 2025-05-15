const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { username, email, password, isPrivate } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, isPrivate });
    await user.save();
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).send('Error registering user');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid credentials');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid credentials');

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.send({ token, username: user.username, isAdmin: user.isAdmin, isPrivate: user.isPrivate });
  } catch (err) {
    res.status(400).send('Error logging in');
  }
});

router.put('/update-privacy', auth, async (req, res) => {
  const { isPrivate } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.isPrivate = isPrivate;
    await user.save();
    res.send('Privacy updated');
  } catch (err) {
    res.status(400).send('Error updating privacy');
  }
});

module.exports = router;
