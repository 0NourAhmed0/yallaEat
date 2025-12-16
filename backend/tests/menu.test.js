// Import helper functions to create test users and menu items
const { createAgent, createAdmin, createCustomer, createMenuItem } = require("./testUtils");

// Test suite for Menu Items functionality
// Note: The menu uses Proxy pattern for caching (happens automatically in the background)
describe("Menu Items (Proxy caching behind the scenes)", () => {
  // Test 1: Check if anyone (even without login) can view the menu
  test("public can list menu items", async () => {
    // Create a test agent (no login needed - public access)
    const agent = createAgent();
    
    // Make a GET request to get all menu items
    const res = await agent.get("/api/menu-items");
    
    // Verify the response status is 200 (success)
    expect(res.status).toBe(200);
    
    // Verify the response has success: true
    expect(res.body.success).toBe(true);
    
    // Verify the items are returned as an array
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  // Test 2: Check Role-Based Access Control (RBAC) for menu management
  test("admin can add menu item; customer cannot", async () => {
    // Step 1: Create an admin user and log them in
    const adminAgent = createAgent();
    await createAdmin(adminAgent, { email: "admin@example.com" });

    // Step 2: Admin tries to add a new menu item (Pizza for $80)
    const { res: addRes } = await createMenuItem(adminAgent, { name: "Pizza", price: 80 });
    
    // Verify admin successfully added the item (status 201 = created)
    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.menuItem.name).toBe("Pizza");

    // Step 3: Verify the item appears in the menu list
    const listRes = await adminAgent.get("/api/menu-items");
    expect(listRes.status).toBe(200);
    expect(listRes.body.items).toHaveLength(1); // Should have exactly 1 item now

    // Step 4: Create a customer user (not admin)
    const customerAgent = createAgent();
    await createCustomer(customerAgent, { email: "cust@example.com" });

    // Step 5: Customer tries to add a menu item (should be forbidden)
    const denied = await customerAgent.post("/api/menu-items").send({ name: "X", price: 1 });
    
    // Verify customer got 403 (Forbidden) - they don't have permission
    expect(denied.status).toBe(403);
  });
});
