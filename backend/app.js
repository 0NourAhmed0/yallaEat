require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const { webhook } = require("./controllers/paymentController");
// Middlewares
//for the online payment stripe
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);
//end stripe middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
    
  })
);

//routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // Staff & admin routes
const menuItemRoutes = require("./routes/menuItemRoutes"); //menuitem routes
const orderRoutes = require("./routes/orderRoutes"); // order routes
const feedbackRoutes = require("./routes/feedbackRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),  // important!
  webhook
);


//routes middleware
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/payments", paymentRoutes);

// cache routes
// const cacheRoutes = require('./routes/cacheRoutes');
// app.use('/api/admin/cache', cacheRoutes);


// endpoint
app.get("/", (req, res) => {
  res.send("YallaEat API is running ");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Export the app for testing (Supertest/Jest).
module.exports = app;

// Only connect & listen when running directly: `node app.js` / `nodemon app.js`
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log(" Connected to MongoDB");
      app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
    })
    .catch((err) => console.error("MongoDB connection failed:", err));
}
