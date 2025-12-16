// Import helper functions to create test users, staff, and menu items
const {
  createAgent,
  createAdmin,
  createCustomer,
  createStaff,
  createMenuItem,
} = require("./testUtils");

// Test suite for Orders functionality
describe("Orders", () => {
  // Test 1: Check if order creation calculates totals and estimated time correctly
  test("customer can place order; totals & estimated ready time are calculated from menu items", async () => {
    // Step 1: Create an admin user (needed to create menu items)
    const adminAgent = createAgent();
    await createAdmin(adminAgent, { email: "admin_orders@example.com" });

    // Step 2: Admin creates a menu item (Burger for $50)
    const { res: menuRes } = await createMenuItem(adminAgent, {
      name: "Burger",
      price: 50,
    });
    // Save the menu item ID to use in the order
    const menuItemId = menuRes.body.menuItem._id;

    // Step 3: Create a customer user
    const customerAgent = createAgent();
    await createCustomer(customerAgent, { email: "customer_orders@example.com" });

    // Step 4: Customer places an order for 2 burgers
    const createRes = await customerAgent.post("/api/orders").send({
      items: [{ menuItem: menuItemId, quantity: 2 }], // 2 burgers
      paymentMethod: "Cash",
      isDelivery: false,
    });

    // Step 5: Verify order was created successfully (status 201 = created)
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    
    // Step 6: Verify total price calculation: 2 burgers × $50 = $100
    expect(createRes.body.order.totalPrice).toBe(100);
    
    // Step 7: Verify estimated ready time: 10 minutes per item × 2 items = 20 minutes
    expect(createRes.body.order.estimatedReadyTime).toBe(20); // 10 minutes per quantity
    
    // Step 8: Verify order number format is correct (e.g., "ORD-1234")
    expect(createRes.body.order.orderNumber).toMatch(/^ORD-\d{4}$/);

    // Step 9: Verify customer can see their own orders
    const myOrders = await customerAgent.get("/api/orders/my-orders");
    expect(myOrders.status).toBe(200);
    expect(myOrders.body.success).toBe(true);
    expect(myOrders.body.orders).toHaveLength(1); // Should have exactly 1 order
  });

  // Test 2: Check Role-Based Access Control (RBAC) for viewing all orders
  test("RBAC: customer cannot list all orders; staff can", async () => {
    // Step 1: Create an admin user
    const adminAgent = createAgent();
    await createAdmin(adminAgent, { email: "admin_rbac@example.com" });

    // Step 2: Admin creates a staff user
    const { res: staffRes } = await createStaff(adminAgent, {
      email: "staff_rbac@example.com",
    });
    expect(staffRes.status).toBe(201);

    // Step 3: Staff needs to login to get authentication cookie
    const staffAgent = createAgent();
    const staffLogin = await staffAgent.post("/api/auth/login").send({
      email: "staff_rbac@example.com",
      password: "123456",
    });
    expect(staffLogin.status).toBe(200);

    // Step 4: Create a customer user
    const customerAgent = createAgent();
    await createCustomer(customerAgent, { email: "customer_rbac@example.com" });

    // Step 5: Customer tries to view ALL orders (should be forbidden)
    // This endpoint is only for staff/admin to see all orders from all customers
    const denied = await customerAgent.get("/api/orders");
    expect(denied.status).toBe(403); // 403 = Forbidden

    // Step 6: Staff tries to view ALL orders (should be allowed)
    const allowed = await staffAgent.get("/api/orders");
    expect(allowed.status).toBe(200); // 200 = Success
    expect(allowed.body.success).toBe(true);
    expect(Array.isArray(allowed.body.orders)).toBe(true); // Should return an array of orders
  });
});
