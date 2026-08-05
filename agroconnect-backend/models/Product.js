const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy'] },
  price: { type: Number, required: true, min:[0, 'Price cannot be negative'] },
  unit: { type: String, required: true, enum: ['kg', 'dozen', 'litre'] },
  quantity: { type: Number, required: true, min:[0, 'Quantity cannot be negative'] },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);