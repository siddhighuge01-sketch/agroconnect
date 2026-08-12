const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

function getCommissionRate(totalPrice) {
  if (totalPrice < 500) return 0.10;
  if (totalPrice <= 2000) return 0.07;
  return 0.05;
}

async function handleReferralCredit(buyerId) {
  const buyer = await User.findById(buyerId);
  if (!buyer || buyer.hasPlacedFirstOrder || !buyer.referredBy) return;

  buyer.hasPlacedFirstOrder = true;
  await buyer.save();

  const referrer = await User.findById(buyer.referredBy);
  if (referrer) {
    referrer.referralCredits += 200;
    await referrer.save();
  }
}

// CREATE an order — supports optional coupon code
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can place orders' });
    }

    const { productId, quantity, couponCode } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({ error: 'Not enough quantity available' });
    }

    let totalPrice = product.price * quantity;
    let discountAmount = 0;
    let appliedCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (
        coupon && coupon.isActive && coupon.expirationDate >= new Date() &&
        (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) &&
        totalPrice >= coupon.minOrderValue
      ) {
        discountAmount = coupon.discountType === 'percentage'
          ? (totalPrice * coupon.discountValue) / 100
          : coupon.discountValue;
        if (coupon.maxDiscountCap !== null) discountAmount = Math.min(discountAmount, coupon.maxDiscountCap);
        discountAmount = Math.min(discountAmount, totalPrice);
        appliedCode = coupon.code;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const finalPrice = totalPrice - discountAmount;
    const commissionRate = getCommissionRate(finalPrice);
    const commission = finalPrice * commissionRate;

    const order = new Order({
      productId,
      buyerId: req.user.userId,
      farmerId: product.farmerId,
      quantity,
      totalPrice: finalPrice,
      commission,
      commissionRate,
      couponCode: appliedCode,
      discountAmount
    });

    await order.save();

    product.quantity -= quantity;
    await product.save();

    await handleReferralCredit(req.user.userId);

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

// UPDATE order status — farmer only, own orders only
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

// CANCEL an order — buyer only, own order, only if still pending
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.buyerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    const product = await Product.findById(order.productId);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
