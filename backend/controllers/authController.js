const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const User = require("../models/user");

const generateToken = (user) => {
  return jwt.sign(
    { user: { id: user._id, role: user.role, email: user.email } },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );
};

const authController = {
  //this is for customers & admins (admins won't be available in the frontend! but put straight into the database) staffs will be added by admin via a separate staff management system (implemented in adminController)
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // only allow "customer" or "admin"
      const userRole = role && role.toLowerCase() === "admin" ? "admin" : "customer"; // Default to "customer" if not "admin"

      // Create user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: userRole, // Default to "customer" 
      });

      // Generate token
      const token = generateToken(newUser);

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      //cehck if this user was blocked by admin
      if (user.disabled) {
        return res.status(403).json({ message: "Your account is disabled. Please contact the restaurant." });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const currentDateTime = new Date();
      const expiresAt = new Date(+currentDateTime + 1800000); // 30 mins

      // Generate token
      const token = generateToken(user);

      res.cookie("token", token, {
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  },

logout: async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
},


  forgetPassword: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      const otp = crypto.randomBytes(3).toString('hex');
      const otpExpires = Date.now() + 15 * 60 * 1000;

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      console.log("OTP saved to DB:", user.otp);

      await sendOtpEmail(email, otp);

      res.status(200).json({ message: "OTP sent to your email address" });
    } catch (error) {
      res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
  },

  // Public - Step 2: Reset with OTP
  resetPasswordWithOtp: async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: "OTP is invalid or has expired" });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error resetting password", error: error.message });
    }
  },
};
//to send OTP email!
const sendOtpEmail = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP',
    text: `Hello!\nIt seems like you forgot your password.\nHere is your OTP for password reset: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { authController, sendOtpEmail };
