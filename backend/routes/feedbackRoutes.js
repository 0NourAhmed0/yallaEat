const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  hideFeedback,
} = require("../controllers/feedbackController");

// middlewares
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const authorizationMiddleware = require("../middleware/authorizationMiddleware");

// POST /api/feedback  (customer creates feedback)
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware(["customer"]),
  createFeedback
);

// GET /api/feedback/my  (customer sees own feedback)
router.get(
  "/my",
  authenticationMiddleware,
  authorizationMiddleware(["customer"]),
  getMyFeedback
);

// GET /api/feedback  (admin or staff sees all feedback)
router.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware(["admin", "staff"]),
  getAllFeedback
);

// PUT /api/feedback/:id/hide  (admin hides feedback)
router.put(
  "/:id/hide",
  authenticationMiddleware,
  authorizationMiddleware(["admin"]),
  hideFeedback
);

module.exports = router;
