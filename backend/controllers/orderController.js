const Order = require('../models/order');
const MenuItem = require('../models/menuItem');

//for the emailNotifier and observer pattern
const { Subject } = require('../observers/observer');
const EmailNotifier = require('../observers/emailNotifier');

const createOrder = async (req, res) => {
  const shortId = Math.floor(1000 + Math.random() * 9000);
   // Setup el Observer
  const orderCreated = new Subject();
  const emailNotifier = new EmailNotifier();
  orderCreated.subscribe(emailNotifier);
  //////
  
  try {
    const { items } = req.body;
    const verifiedItems = await Promise.all(items.map(async (item) => {
      const product = await MenuItem.findById(item.menuItem);
      if (!product) {
        throw new Error(`Menu item not found with ID: ${item.menuItem}`);
      }
      return {
        menuItem: product._id,
        quantity: item.quantity,
        price: product.price
      };
    }));
    const calculatedTotal = verifiedItems.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    const newOrder = new Order({
      user: req.user._id,
      items: verifiedItems,
      totalPrice: calculatedTotal,
      paymentMethod: req.body.paymentMethod || 'Cash',
      orderNumber: `ORD-${shortId}`
    });
    await newOrder.save();

    // Notify observers AFTER order creation
    orderCreated.notify({
      id: newOrder._id,
      orderNumber: newOrder.orderNumber,
      userEmail: req.user.email,
      userName: req.user.name,
      status: "Created"
    });
    //////


    res.status(201).json({ 
      success: true, 
      message: "Order placed successfully", 
      order: newOrder 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Failed to place order", 
      error: error.message 
    });
  }
};
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch your orders", error: error.message });
  }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status }, 
      { new: true, runValidators: true }
    ).populate('user', 'name email'); // populate customer for the email and observer
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    ////for the emailNotifier and observer pattern
    order.status = status;
    await order.save();

    // Setup Observer
    const orderStatusChanged = new Subject();
    const emailNotifier = new EmailNotifier();
    orderStatusChanged.subscribe(emailNotifier);

    // Only send emails for certain statuses
    if (status === "Ready" || status === "Cancelled") {
      orderStatusChanged.notify({
        orderNumber: order.orderNumber,
        userEmail: order.user.email,
        userName: order.user.name,
        status: status
      });
    }    
    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update status", error: error.message });
  }
};
const orderController = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
module.exports = orderController;