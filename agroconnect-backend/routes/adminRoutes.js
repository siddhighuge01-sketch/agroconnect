const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }

    const orders = await Order.find();
    const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0);
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    const totalProducts = await Product.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });

    res.json({
      totalOrders: orders.length,
      totalCommission,
      totalRevenue,
      totalProducts,
      totalFarmers,
      totalBuyers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;