const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
  totalPrice: { type: Number, required: true },
  commission: { type: Number, required: true },
  commissionRate: { type: Number, required: true },
  couponCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  reminderSent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
