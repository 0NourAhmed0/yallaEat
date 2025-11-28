const express = require("express");
const router = express.Router();
const {
  createReservation,
  updateReservation,
  cancelReservation,
  getReservation
} = require("../controllers/reservationController");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const authorizationMiddleware = require("../middleware/authorizationMiddleware");

router.post("/", authenticationMiddleware, authorizationMiddleware(["customer"]), createReservation);
router.put("/:id", authenticationMiddleware, authorizationMiddleware(["customer", "admin", "staff"]), updateReservation);
router.put("/cancel/:id", authenticationMiddleware, authorizationMiddleware(["customer", "admin", "staff"]), cancelReservation);
router.get("/:id", authenticationMiddleware, authorizationMiddleware(["customer", "admin", "staff"]), getReservation);

module.exports = router;