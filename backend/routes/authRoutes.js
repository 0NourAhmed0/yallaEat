const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticationMiddleware"); //yet to be made
const authorize = require("../middleware/authorizationMiddleware"); //same here
const authController = require("../controllers/authController");




router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/forgetPassword", authController.forgetPassword);
router.post("/logout",authController.logout);
router.put("/resetPasswordWithOtp", authController.resetPasswordWithOtp); // Reset password with OTP

router.put('/user/:id' ,authenticate, authorize((['staff' , 'customer'])) , authController.updateProfile);
router.delete('/user/:id' ,authenticate, authorize((['staff' , 'customer '])) , authController.deleteProfile);

module.exports = router;

