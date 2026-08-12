const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const authMiddleware = require('../middleware/auth');

// CREATE coupon — admin only
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LIST all coupons — admin only
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VALIDATE coupon — any logged-in buyer, used at checkout
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase() });

    if (!coupon || !coupon.isActive) return res.status(400).json({ error: 'Invalid coupon code' });
    if (coupon.expirationDate < new Date()) return res.status(400).json({ error: 'Coupon has expired' });
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }
    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({ error: `Minimum order value is Rs.${coupon.minOrderValue}` });
    }

    let discount = coupon.discountType === 'percentage'
      ? (orderValue * coupon.discountValue) / 100
      : coupon.discountValue;

    if (coupon.maxDiscountCap !== null) discount = Math.min(discount, coupon.maxDiscountCap);
    discount = Math.min(discount, orderValue);

    res.json({ valid: true, discount, code: coupon.code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
