const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  orderId: { type: String, required: true, unique: true },
  canteenName: { type: String, required: true },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["order placed", "accepted", "processing", "order ready", "collected"],
    default: "order placed" 
  },
  paymentMode: { type: String, enum: ["online", "cash"], required: true },
  orderedDate: { type: Date, default: Date.now },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);