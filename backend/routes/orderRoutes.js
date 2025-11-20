const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const authorizationMiddleware = require('../middleware/authorizationMiddleware');
router.post('/', 
  authenticationMiddleware, 
  authorizationMiddleware(['customer']), 
  orderController.createOrder
);
router.get('/my-orders', 
  authenticationMiddleware, 
  authorizationMiddleware(['customer']), 
  orderController.getMyOrders
);
router.get('/', 
  authenticationMiddleware, 
  authorizationMiddleware(['admin', 'staff']), 
  orderController.getAllOrders
);
router.put('/:id', 
  authenticationMiddleware, 
  authorizationMiddleware(['admin', 'staff']), 
  orderController.updateOrderStatus
);
module.exports = router;