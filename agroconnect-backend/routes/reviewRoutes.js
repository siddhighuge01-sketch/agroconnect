const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// CREATE a review — buyer only, own delivered order, once per order
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can leave reviews' });
    }

    const { orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.buyerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only review your own orders' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'You can only review delivered orders' });
    }
    if (order.reviewed) {
      return res.status(400).json({ error: 'You have already reviewed this order' });
    }

    const review = new Review({
      orderId,
      productId: order.productId,
      farmerId: order.farmerId,
      buyerId: req.user.userId,
      rating,
      comment
    });
    await review.save();

    order.reviewed = true;
    await order.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET reviews + average rating for a farmer — public
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const reviews = await Review.find({ farmerId: req.params.farmerId })
      .populate('buyerId', 'name')
      .sort({ createdAt: -1 });

    const average = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
      : 0;

    res.json({ average: Number(average.toFixed(1)), count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
