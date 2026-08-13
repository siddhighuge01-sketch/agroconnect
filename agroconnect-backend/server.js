const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const couponRoutes = require('./routes/couponRoutes');
app.use('/api/coupons', couponRoutes);

const referralRoutes = require('./routes/referralRoutes');
app.use('/api/referral', referralRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('AgroConnect backend is running');
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'Hello from AgroConnect backend!' });
});

// Abandoned cart / re-engagement scan — runs every 30 minutes
const Order = require('./models/Order');
setInterval(async () => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const stale = await Order.find({ status: 'pending', reminderSent: false, createdAt: { $lte: twoHoursAgo } });
    for (const order of stale) {
      console.log(`[AUTO REMINDER] Order ${order._id} is stale, marking reminder sent`);
      order.reminderSent = true;
      await order.save();
    }
  } catch (err) {
    console.error('Abandoned cart scan error:', err.message);
  }
}, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
