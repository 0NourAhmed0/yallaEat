const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/authenticationMiddleware"); //yet to be made
const authorize = require("../middleware/authorizationMiddleware"); //same here
const { getProfile } = require("../controllers/authController");

// Public profile route (requires authentication)
router.get('/profile', authenticate, getProfile);

router.use(authenticate);

// Admin only routes, everythingthe staff need to do is in the other controllers , thus the other routes unless we give more features
router.get('/users', authorize(['admin']), adminController.getAllUsers);
router.post('/staff', authorize(['admin']), adminController.addStaff);
router.put('/staff/:id', authorize(['admin']), adminController.updateStaff);
router.put('/disable-customer/:id', authorize(['admin']), adminController.disableCustomer);
router.put('/enable-customer/:id', authorize(['admin']), adminController.enableCustomer);
router.delete('/staff/:id', authorize(['admin']), adminController.deleteStaff);

module.exports = router;




