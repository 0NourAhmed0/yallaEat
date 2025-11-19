const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const authorizationMiddleware = require('../middleware/authorizationMiddleware');

// Public route: Get all menu items
router.get('/', menuItemController.getAllMenuItems);

// Admin-only routes: Add, Update, Delete menu items
router.post('/', authenticationMiddleware, authorizationMiddleware(['admin', 'staff']), menuItemController.addMenuItem);
router.put('/:id', authenticationMiddleware, authorizationMiddleware(['admin', 'staff']), menuItemController.updateMenuItem);
router.delete('/:id', authenticationMiddleware, authorizationMiddleware(['admin', 'staff']), menuItemController.deleteMenuItem);

module.exports = router;
