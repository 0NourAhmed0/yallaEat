require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Middlewares
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


//routes middleware
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);




// endpoint
app.get("/", (req, res) => {
  res.send("YallaEat API is running ");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log(" Connected to MongoDB");
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection failed:", err));
