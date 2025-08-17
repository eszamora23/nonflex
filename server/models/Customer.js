import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  tenant: { type: String, required: true },
  profile: {
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    phone: String,
  },
  addresses: [AddressSchema],
}, { timestamps: true });

export default mongoose.model('Customer', CustomerSchema);
