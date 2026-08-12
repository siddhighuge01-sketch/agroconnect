const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Platform stats
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

// Abandoned cart / re-engagement scan (manual trigger)
router.post('/abandoned-scan', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const stale = await Order.find({ status: 'pending', reminderSent: false, createdAt: { $lte: twoHoursAgo } })
      .populate('buyerId', 'name phone email')
      .populate('productId', 'name');

    for (const order of stale) {
      console.log(`[REMINDER TRIGGER] Order ${order._id} — notify ${order.buyerId?.name} (${order.buyerId?.phone || order.buyerId?.email}) about "${order.productId?.name}"`);
      order.reminderSent = true;
      await order.save();
    }

    res.json({
      triggered: stale.length,
      orders: stale.map(o => ({ id: o._id, buyer: o.buyerId?.name, product: o.productId?.name }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
