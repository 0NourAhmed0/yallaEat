const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  status: {
    type: String,
    enum: ["processing", "on_the_way", "arriving", "delivered"],
    default: "processing"
  },
  progress: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Delivery", DeliverySchema);
