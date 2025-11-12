const MenuItem = require('../models/menuItem');

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch menu items", error: error.message });
  }
};

// Add a new menu item
const addMenuItem = async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to add menu item", error: error.message });
  }
};

// Update an existing menu item
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ success: false, message: "MenuItem not found" });
    }

    res.status(200).json({ success: true, menuItem });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update menu item", error: error.message });
  }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ success: false, message: "MenuItem not found" });
    }

    res.status(200).json({ success: true, message: "MenuItem deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete menu item", error: error.message });
  }
};

// Export all functions in a single object
const menuItemController = {
  getAllMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};

module.exports = menuItemController;
