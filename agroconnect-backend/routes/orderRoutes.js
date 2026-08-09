const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

function getCommissionRate(totalPrice) {
  if (totalPrice < 500) return 0.10;
  if (totalPrice <= 2000) return 0.07;
  return 0.05;
}

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
    const commissionRate = getCommissionRate(totalPrice);
    const commission = totalPrice * commissionRate;

    const order = new Order({
      productId,
      buyerId: req.user.userId,
      farmerId: product.farmerId,
      quantity,
      totalPrice,
      commission,
      commissionRate // stored so you can show "7% applied" later if you want
    });

    await order.save();

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


const VALID_STATUSES = ['pending', 'confirmed', 'out_for_delivery', 'delivered'];

// UPDATE order status — farmer only, and only for their own orders
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can update order status' });
    }

    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own orders' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;