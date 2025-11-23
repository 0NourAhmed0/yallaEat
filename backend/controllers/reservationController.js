const Reservation = require("../models/reservation");

const createReservation = async (req, res) => {
  try {
    // Set customer_id from authenticated user
    const reservationData = {
      ...req.body,
      customer_id: req.user._id
    };
    const reservation = await Reservation.create(reservationData);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const updated = await Reservation.findOneAndUpdate(
      { reservation_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const cancelled = await Reservation.findOneAndUpdate(
      { reservation_id: req.params.id },
      { status: "cancelled" },
      { new: true }
    );
    res.json(cancelled);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ reservation_id: req.params.id })
      .populate("customer_id")
      .populate("table_id")
      .populate("staff_id");

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reservationController = {
  createReservation,
  updateReservation,
  cancelReservation,
  getReservation
};

module.exports = reservationController;
