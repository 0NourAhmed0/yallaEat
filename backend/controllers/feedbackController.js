const Feedback = require("../models/feedback.model");

// POST /api/feedback
exports.createFeedback = async (req, res) => {
  try {
    const { rating, comment, reservationId } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      rating,
      comment,
      reservationId,
    });

    console.log("[FEEDBACK_CREATED]", feedback._id.toString());

    res.status(201).json({
      status: "success",
      data: feedback,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/feedback/my
exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      userId: req.user._id,
      hidden: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: feedback.length,
      data: feedback,
    });
  } catch (error) {
    console.error("Error getting my feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ hidden: false })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: feedback.length,
      data: feedback,
    });
  } catch (error) {
    console.error("Error getting all feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/feedback/:id/hide
exports.hideFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { hidden: true },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    console.log("[FEEDBACK_HIDDEN]", feedback._id.toString());

    res.status(200).json({
      status: "success",
      data: feedback,
    });
  } catch (error) {
    console.error("Error hiding feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};
