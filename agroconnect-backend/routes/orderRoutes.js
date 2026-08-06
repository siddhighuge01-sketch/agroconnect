const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const COMMISSION_RATE = 0.05; // 5%

// CREATE an order
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can place orders' });
    }

    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({ error: 'Not enough quantity available' });
    }

    const totalPrice = product.price * quantity;
    const commission = totalPrice * COMMISSION_RATE;

    const order = new Order({
      productId,
      buyerId: req.user.userId,
      farmerId: product.farmerId,
      quantity,
      totalPrice,
      commission
    });

    await order.save();

    // Reduce available stock
    product.quantity -= quantity;
    await product.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET orders for the logged-in user (works for both buyer and farmer)
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'farmer'
      ? { farmerId: req.user.userId }
      : { buyerId: req.user.userId };

    const orders = await Order.find(filter).populate('productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;