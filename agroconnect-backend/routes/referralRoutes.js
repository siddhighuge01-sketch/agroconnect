const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const referredUsers = await User.find({ referredBy: user._id }).select('name hasPlacedFirstOrder createdAt');

    res.json({
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${user.referralCode}`,
      totalInvites: referredUsers.length,
      completedOrders: referredUsers.filter(u => u.hasPlacedFirstOrder).length,
      creditsEarned: user.referralCredits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
