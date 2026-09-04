const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

function generateReferralCode(name) {
  const prefix = name.replace(/\s+/g, '').slice(0, 4).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${random}`;
}

// REGISTER a new user (farmer or buyer)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, location, phone, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) referredBy = referrer._id;
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      location,
      phone,
      referralCode: generateReferralCode(name),
      referredBy
    });

    await user.save();

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
