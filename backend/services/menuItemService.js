// backend/services/menuItemService.js

const MenuItem = require('../models/menuItem');
const cacheProxy = require('../proxies/cacheProxy');

class MenuItemService {

  //Get all menu items with caching

  async getAllMenuItems(filters = {}) {
    const cacheKey = `menu:all:${JSON.stringify(filters)}`;

    return await cacheProxy.get(
      cacheKey,
      async () => {
        // This function only executes on cache miss
        const query = {};

        if (filters.category) {
          query.category = filters.category;
        }

        if (filters.isAvailable !== undefined) {
          query.isAvailable = filters.isAvailable;
        }

        return await MenuItem.find(query).sort({ name: 1 });
      },
      10 * 60 * 1000 // Cache for 10 minutes
    );
  }

  //Get menu item by ID with caching

  async getMenuItemById(id) {
    const cacheKey = `menu:${id}`;

    return await cacheProxy.get(
      cacheKey,
      async () => {
        return await MenuItem.findById(id);
      },
      15 * 60 * 1000 // Cache for 15 minutes
    );
  }


  //Get menu items by category with caching

  async getMenuItemsByCategory(category) {
    const cacheKey = `menu:category:${category}`;

    return await cacheProxy.get(
      cacheKey,
      async () => {
        return await MenuItem.find({ category, isAvailable: true })
          .sort({ name: 1 });
      },
      10 * 60 * 1000
    );
  }


  //Create new menu item and invalidate cache

  async createMenuItem(data) {
    const menuItem = await MenuItem.create(data);

    // Invalidate all menu-related cache
    cacheProxy.invalidatePattern('menu:');

    return menuItem;
  }


  //Update menu item and invalidate cache

  async updateMenuItem(id, data) {
    const menuItem = await MenuItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });

    // Invalidate specific item and list caches
    cacheProxy.invalidate(`menu:${id}`);
    cacheProxy.invalidatePattern('menu:all');
    cacheProxy.invalidatePattern('menu:category');

    return menuItem;
  }


  //Delete menu item and invalidate cache

  async deleteMenuItem(id) {
    const menuItem = await MenuItem.findByIdAndDelete(id);

    // Invalidate all menu-related cache
    cacheProxy.invalidatePattern('menu:');

    return menuItem;
  }


  //Get popular menu items (most ordered)

  async getPopularItems(limit = 10) {
    const cacheKey = `menu:popular:${limit}`;

    return await cacheProxy.get(
      cacheKey,
      async () => {
        // Assuming you have an orderCount field
        return await MenuItem.find({ isAvailable: true })
          .sort({ orderCount: -1 })
          .limit(limit);
      },
      30 * 60 * 1000 // Cache for 30 minutes
    );
  }
}

module.exports = new MenuItemService();