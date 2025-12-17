// Import helper functions to create test users and make API requests
const { createAgent, createCustomer } = require("./testUtils");

// Test suite for Authentication functionality
describe("Auth", () => {
  // User Story: As a customer, I want to register for an account so that I can order food.
  // Test 1: Check if customer registration and login works correctly
  test("customer can register and then check auth via cookie", async () => {
    // Create a test agent (like a browser that can make HTTP requests)
    const agent = createAgent();

    // Register a new customer account (this also logs them in automatically)
    await createCustomer(agent, { email: "customer1@example.com" });

    // Check if the user is authenticated by calling the check endpoint
    // This endpoint reads the cookie and tells us if user is logged in
    const checkRes = await agent.get("/api/auth/check");

    // Verify the response status is 200 (success)
    expect(checkRes.status).toBe(200);

    // Verify the response body contains success and authentication info
    expect(checkRes.body).toMatchObject({
      success: true,
      isAuthenticated: true,
    });

    // Verify the user email matches what we registered
    expect(checkRes.body.user.email).toBe("customer1@example.com");

    // Verify the user role is "customer"
    expect(checkRes.body.user.role).toBe("customer");
  });

  // Test 2: Check if login security works (wrong password should fail)
  test("login fails with wrong password", async () => {
    // Create a test agent
    const agent = createAgent();

    // First, register a customer with password "123456"
    await createCustomer(agent, { email: "customer2@example.com", password: "123456" });

    // Try to login with the WRONG password
    const loginRes = await agent.post("/api/auth/login").send({
      email: "customer2@example.com",
      password: "wrong", // Wrong password!
    });

    // Verify the login failed with status 400 (bad request)
    expect(loginRes.status).toBe(400);

    // Verify the error message says "Invalid credentials"
    expect(loginRes.body.message).toBe("Invalid credentials");
  });
});
