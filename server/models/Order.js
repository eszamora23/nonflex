import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
  {
    sku: String,
    name: String,
    qty: Number,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    tenant: { type: String, required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    orderId: String,
    items: [ItemSchema],
    total: Number,
    carrier: String,
    tracking: String,
    status: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);
