// Import helper functions to create test users
const { createAgent, createAdmin, createCustomer } = require("./testUtils");

// Test suite for Feedback functionality
describe("Feedback", () => {
  // Test 1: Check if customers can create feedback and admins can view it
  test("customer can create feedback; admin can view all feedback", async () => {
    // Step 1: Create admin and customer users
    const adminAgent = createAgent();
    await createAdmin(adminAgent, { email: "admin_feedback@example.com" });

    const customerAgent = createAgent();
    await createCustomer(customerAgent, { email: "customer_feedback@example.com" });

    // Step 2: Customer creates feedback (rating 5 stars + comment)
    const createRes = await customerAgent.post("/api/feedback").send({
      rating: 5,
      comment: "Great food!",
    });
    
    // Verify feedback was created successfully (status 201 = created)
    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe("success");
    expect(createRes.body.data.rating).toBe(5);
    expect(createRes.body.data.comment).toBe("Great food!");

    // Step 3: Customer can view their own feedback
    const myFeedback = await customerAgent.get("/api/feedback/my");
    expect(myFeedback.status).toBe(200);
    expect(myFeedback.body.data).toHaveLength(1); // Should have exactly 1 feedback

    // Step 4: Admin can view ALL feedback from all customers
    const allFeedback = await adminAgent.get("/api/feedback");
    expect(allFeedback.status).toBe(200);
    expect(allFeedback.body.data.length).toBeGreaterThanOrEqual(1); // At least 1 feedback
  });

  // Test 2: Check Role-Based Access Control (RBAC) for feedback management
  test("RBAC: customer cannot view all feedback; admin can hide feedback", async () => {
    // Step 1: Create admin and customer users
    const adminAgent = createAgent();
    await createAdmin(adminAgent, { email: "admin_feedback2@example.com" });

    const customerAgent = createAgent();
    await createCustomer(customerAgent, { email: "customer_feedback2@example.com" });

    // Step 2: Customer creates feedback
    const createRes = await customerAgent.post("/api/feedback").send({
      rating: 4,
      comment: "Nice service",
    });
    expect(createRes.status).toBe(201);
    
    // Save the feedback ID (needed to hide it later)
    const feedbackId = createRes.body.data._id;

    // Step 3: Customer tries to view ALL feedback (should be forbidden)
    // Only admins/staff can see all feedback, customers can only see their own
    const denied = await customerAgent.get("/api/feedback");
    expect(denied.status).toBe(403); // 403 = Forbidden

    // Step 4: Admin can hide feedback (e.g., if it's inappropriate)
    const hideRes = await adminAgent.put(`/api/feedback/${feedbackId}/hide`);
    expect(hideRes.status).toBe(200);
    expect(hideRes.body.data.hidden).toBe(true); // Feedback is now hidden
  });
});
