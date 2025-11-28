const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const authorizationMiddleware = require("../middleware/authorizationMiddleware");

// Create PaymentIntent (frontend)
router.post(
  "/create-payment-intent",
  authenticationMiddleware,
  authorizationMiddleware(["customer"]),
  paymentController.createPaymentIntent
);

// Stripe webhook (Stripe calls this automatically)
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.webhook);

module.exports = router;
