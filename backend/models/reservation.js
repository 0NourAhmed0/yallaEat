const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  reservation_id: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true,
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // table_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Table",
  //   required: true,
  // },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    default: null
  },
  reservation_date: {
    type: String,
    required: true,
  },
  reservation_time: {
    type: String,
    required: true,
  },
  party_size: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled" , "rejected"],
    default: "pending",
  },
});

// Set reservation_id to _id before saving
reservationSchema.pre('save', function(next) {
  if (!this.reservation_id) {
    this.reservation_id = this._id;
  }
  next();
});

module.exports = mongoose.model("Reservation", reservationSchema);
