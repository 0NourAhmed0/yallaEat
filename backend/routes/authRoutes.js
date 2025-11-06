const express = require("express");
const router = express.Router();
const { authController } = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/forgetPassword", authController.forgetPassword);
router.post("/logout",authController.logout);
router.put("/resetPasswordWithOtp", authController.resetPasswordWithOtp); // Reset password with OTP
module.exports = router;
