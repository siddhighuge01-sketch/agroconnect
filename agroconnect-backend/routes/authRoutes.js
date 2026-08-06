const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// REGISTER a new user (farmer or buyer)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, location, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password before saving — never store plain text
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      location,
      phone
    });

    await user.save();

    // Send back the user, but strip out the password before responding
    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.status(201).json(userToReturn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.json({ token, user: userToReturn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;