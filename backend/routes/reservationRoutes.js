const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/reservationController");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const authorizationMiddleware = require("../middleware/authorizationMiddleware");

// Get available tables
router.get("/available-tables", getAvailableTables);

// Get all reservations (staff/admin only)
router.get("/all", authenticationMiddleware, authorizationMiddleware(["admin", "staff"]), getAllReservations);

// Get customer's own reservations
router.get("/my-reservations", authenticationMiddleware, authorizationMiddleware(["customer"]), getCustomerReservations);

// Create reservation
router.post("/", authenticationMiddleware, authorizationMiddleware(["customer"]), createReservation);

// Confirm reservation (staff/admin only)
router.patch("/:id/confirm", authenticationMiddleware, authorizationMiddleware(["admin", "staff"]), confirmReservation);

// Reject reservation (staff/admin only)
router.patch("/:id/reject", authenticationMiddleware, authorizationMiddleware(["admin", "staff"]), rejectReservation);

// Cancel reservation
router.patch("/:id/cancel", authenticationMiddleware, authorizationMiddleware(["customer", "admin", "staff"]), cancelReservation);

// Select table for reservation (staff/admin only)
router.post("/:id/select-table", authenticationMiddleware, authorizationMiddleware(["admin", "staff"]), selectTable);

// Update table selection (staff/admin only)
router.patch("/:id/update-table", authenticationMiddleware, authorizationMiddleware(["admin", "staff"]), updateTableSelection);

// Get specific reservation
router.get("/:id", authenticationMiddleware, authorizationMiddleware(["customer", "admin", "staff"]), getReservation);

// Update reservation
router.put("/:id", authenticationMiddleware, authorizationMiddleware(["customer", "admin", "staff"]), updateReservation);

module.exports = router;