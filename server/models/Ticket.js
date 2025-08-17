import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  tenant: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  subject: String,
  description: String,
  status: { type: String, default: 'open' },
}, { timestamps: true });

export default mongoose.model('Ticket', TicketSchema);
