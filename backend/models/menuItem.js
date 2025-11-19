const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true},
  description: { type: String},
  price: { type: Number, required: true, min: 0 }, //makes sure price isnt negative
  category: { type: String},
  imageUrl: { type: String},
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("MenuItem", menuItemSchema);
