const MenuItemService = require('../../services/menuItemService');
const MenuItem = require('../../models/menuItem');
const cacheProxy = require('../../proxies/cacheProxy');

// Mock dependencies
jest.mock('../../models/menuItem');
jest.mock('../../proxies/cacheProxy');

describe('MenuItemService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllMenuItems', () => {
        test('should return items from cache if available', async () => {
            // Arrange
            const mockItems = [{ name: 'Burger', price: 10 }];
            const filters = { category: 'Main' };
            // cacheProxy.get takes (key, fetchFn, ttl). We mock it to return mockItems directly.
            cacheProxy.get.mockResolvedValue(mockItems);

            // Act
            const result = await MenuItemService.getAllMenuItems(filters);

            // Assert
            expect(result).toEqual(mockItems);
            expect(cacheProxy.get).toHaveBeenCalledWith(
                expect.stringContaining('menu:all'),
                expect.any(Function),
                expect.any(Number)
            );
            // Ensure DB was NOT called (because cache returned)
            expect(MenuItem.find).not.toHaveBeenCalled();
        });

        test('should fetch from DB on cache miss', async () => {
            // Arrange
            const filters = { category: 'Main' };
            const dbItems = [{ name: 'Pizza', price: 12 }];

            // cacheProxy.get executes the callback (2nd arg) on miss.
            // We simulate this by making the mock implementation call the callback.
            cacheProxy.get.mockImplementation(async (key, fetchFn, ttl) => {
                return await fetchFn();
            });

            // Mock the Mongoose chain: find().sort()
            const mockSort = jest.fn().mockResolvedValue(dbItems);
            MenuItem.find.mockReturnValue({ sort: mockSort });

            // Act
            const result = await MenuItemService.getAllMenuItems(filters);

            // Assert
            expect(result).toEqual(dbItems);
            expect(MenuItem.find).toHaveBeenCalledWith({ category: 'Main' });
            expect(mockSort).toHaveBeenCalledWith({ name: 1 });
        });
    });

    describe('createMenuItem', () => {
        test('should create item and invalidate cache', async () => {
            // Arrange
            const newItemData = { name: 'Salad', price: 8 };
            const createdItem = { ...newItemData, _id: '123' };

            MenuItem.create.mockResolvedValue(createdItem);

            // Act
            const result = await MenuItemService.createMenuItem(newItemData);

            // Assert
            expect(result).toEqual(createdItem);
            expect(MenuItem.create).toHaveBeenCalledWith(newItemData);
            expect(cacheProxy.invalidatePattern).toHaveBeenCalledWith('menu:');
        });
    });
});
