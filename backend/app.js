
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const { webhook } = require("./controllers/paymentController");

// MongoDB connection
let dbConnection;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnection) {
    dbConnection = mongoose
      .connect(process.env.DB_URL)
      .catch((error) => {
        dbConnection = null;
        console.error("MongoDB connection failed:", error);
        throw error;
      });
  }

  await dbConnection;
};

// Stripe webhook middleware
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Ensure database connection before API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database unavailable:", error.message);
    res.status(503).json({
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("YallaEat API is running");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err);
      process.exit(1);
    });
}
