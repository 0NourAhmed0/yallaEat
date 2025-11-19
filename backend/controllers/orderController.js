const Order = require('../models/order');
const MenuItem = require('../models/menuItem');
const createOrder = async (req, res) => {
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
      paymentMethod: req.body.paymentMethod || 'Cash'
    });
    await newOrder.save();
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
    );
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
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