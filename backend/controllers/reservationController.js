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

const getAllReservations = async (req, res) => {
  try {
    const { status, reservation_date, table_number } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (reservation_date) filter.reservation_date = reservation_date;
    if (table_number) filter.table_number = parseInt(table_number);

    const reservations = await Reservation.find(filter)
      .populate("customer_id", "name email")
      .sort({ reservation_date: 1, reservation_time: 1 });

    res.json({
      count: reservations.length,
      reservations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ reservation_id: req.params.id })
      .populate("customer_id")

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer_id: req.user._id })
      .sort({ reservation_date: -1, reservation_time: -1 });

    res.json({
      count: reservations.length,
      reservations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const updated = await Reservation.findOneAndUpdate(
      { reservation_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ reservation_id: req.params.id });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status === "cancelled") {
      return res.status(400).json({ message: "Cannot confirm a cancelled reservation" });
    }

    const confirmed = await Reservation.findOneAndUpdate(
      { reservation_id: req.params.id },
      { 
        status: "confirmed",
        staff_id: req.user._id // Track which staff member confirmed
      },
      { new: true }
    ).populate("customer_id").populate("staff_id");

    res.json({
      message: "Reservation confirmed successfully",
      reservation: confirmed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ reservation_id: req.params.id });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status === "cancelled") {
      return res.status(400).json({ message: "Cannot reject a cancelled reservation" });
    }

    const rejected = await Reservation.findOneAndUpdate(
      { reservation_id: req.params.id },
      { 
        status: "rejected",
        staff_id: req.user._id // Track which staff member rejected
      },
      { new: true }
    ).populate("customer_id").populate("staff_id");

    res.json({
      message: "Reservation rejected successfully",
      reservation: rejected
    });
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

    if (!cancelled) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json({
      message: "Reservation cancelled successfully",
      reservation: cancelled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const selectTable = async (req, res) => {
  try {
    const { table_number } = req.body;
    const { id } = req.params;

    // Validate table_number
    if (!table_number || table_number < 1 || table_number > 10) {
      return res.status(400).json({ message: "Invalid table number. Must be between 1 and 10." });
    }

    // Check if reservation exists
    const reservation = await Reservation.findOne({ reservation_id: id });
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Check if table is already booked for the same date and time
    const conflictingReservation = await Reservation.findOne({
      table_number,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      status: { $in: ["pending", "confirmed"] },
      reservation_id: { $ne: id }
    });

    if (conflictingReservation) {
      return res.status(409).json({ 
        message: "Table is already reserved for this date and time",
        conflictingReservation 
      });
    }

    // Assign table to reservation
    const updated = await Reservation.findOneAndUpdate(
      { reservation_id: id },
      { 
        table_number,
        staff_id: req.user._id // Track which staff member assigned the table
      },
      { new: true, runValidators: true }
    ).populate("customer_id").populate("staff_id");

    res.json({
      message: "Table selected successfully",
      reservation: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTableSelection = async (req, res) => {
  try {
    const { table_number } = req.body;
    const { id } = req.params;

    // Validate table_number
    if (!table_number || table_number < 1 || table_number > 10) {
      return res.status(400).json({ message: "Invalid table number. Must be between 1 and 10." });
    }

    // Check if reservation exists
    const reservation = await Reservation.findOne({ reservation_id: id });
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Check if table is already booked for the same date and time
    const conflictingReservation = await Reservation.findOne({
      table_number,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      status: { $in: ["pending", "confirmed"] },
      reservation_id: { $ne: id }
    });

    if (conflictingReservation) {
      return res.status(409).json({ 
        message: "Table is already reserved for this date and time",
        conflictingReservation 
      });
    }

    // Update table assignment
    const updated = await Reservation.findOneAndUpdate(
      { reservation_id: id },
      { 
        table_number,
        staff_id: req.user._id // Track which staff member reassigned the table
      },
      { new: true, runValidators: true }
    ).populate("customer_id").populate("staff_id");

    res.json({
      message: "Table selection updated successfully",
      reservation: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableTables = async (req, res) => {
  try {
    const { reservation_date, reservation_time } = req.query;

    if (!reservation_date || !reservation_time) {
      return res.status(400).json({ 
        message: "reservation_date and reservation_time are required" 
      });
    }

    // Find all reserved tables for the given date and time
    const reservedTables = await Reservation.find({
      reservation_date,
      reservation_time,
      status: { $in: ["pending", "confirmed"] }
    }).select("table_number");

    const reservedTableNumbers = reservedTables.map(r => r.table_number);
    
    // All tables (1-10)
    const allTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // Available tables
    const availableTables = allTables.filter(
      table => !reservedTableNumbers.includes(table)
    );

    res.json({
      reservation_date,
      reservation_time,
      availableTables,
      reservedTables: reservedTableNumbers,
      totalAvailable: availableTables.length,
      totalReserved: reservedTableNumbers.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reservationController = {
  createReservation,
  getAllReservations,
  getReservation,
  getCustomerReservations,
  updateReservation,
  confirmReservation,
  rejectReservation,
  cancelReservation,
  selectTable,
  updateTableSelection,
  getAvailableTables
};

module.exports = reservationController;