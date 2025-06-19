const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  canteen: { type: String, required: true },
  category: { type: String, required: true },
  food: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Food', FoodSchema);