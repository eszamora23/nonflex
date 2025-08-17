import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  tenant: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  productId: String,
  quantity: Number,
  price: Number,
  status: String,
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
