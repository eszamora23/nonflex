const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  productId: String,
  quantity: Number,
  price: Number,
  status: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  profile: {
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    phone: String,
  },
  addresses: [AddressSchema],
  orders: [OrderSchema],
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
