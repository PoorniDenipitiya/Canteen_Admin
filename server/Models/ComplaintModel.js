const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  canteenName: { type: String, required: true },
  orderedDate: { type: String, required: true },
  price: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  complaintType: { type: String, required: true },
  title: { type: String, required: true }, // new title field
  description: { type: String, required: true },
  image: { type: String }, // store image filename or URL
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'On Investigation', 'On MO Investigation', 'MO Investigation Completed', 'Investigation Completed', 'Complaint Closed'] },
  action: { type: String, default: '-----', enum: ['-----', 'Refund', 'Reject'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
