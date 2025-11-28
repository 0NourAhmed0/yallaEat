const MenuItem = require('../models/menuItem');
const cacheProxy = require('../proxies/cacheProxy');

// Get all menu items (with caching)
const getAllMenuItems = async (req, res) => {
  try {
    const cacheKey = 'menu:all';
    
    const items = await cacheProxy.get(
      cacheKey,
      async () => {
        // only executes on cache miss
        return await MenuItem.find();
      },
      10 * 60 * 1000 // Cache for 10 minutes
    );
    
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch menu items", 
      error: error.message 
    });
  }
};

// Add a new menu item (invalidate cache)
const addMenuItem = async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    
    // Invalidate all menu-related cache
    cacheProxy.invalidatePattern('menu:');
    
    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Failed to add menu item", 
      error: error.message 
    });
  }
};

// Update an existing menu item (invalidate cache)
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: "MenuItem not found" 
      });
    }

    // Invalidate all menu-related cache
    cacheProxy.invalidatePattern('menu:');
    res.status(200).json({ success: true, menuItem });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Failed to update menu item", 
      error: error.message 
    });
  }
};

// Delete a menu item (invalidate cache)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: "MenuItem not found" 
      });
    }

    // Invalidate all menu-related cache
    cacheProxy.invalidatePattern('menu:');
    res.status(200).json({ 
      success: true, 
      message: "MenuItem deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete menu item", 
      error: error.message 
    });
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