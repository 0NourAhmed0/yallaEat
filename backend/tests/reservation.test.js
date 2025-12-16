// Import helper functions to create test users
const { createAgent, createAdmin, createCustomer, createStaff } = require("./testUtils");

// Test suite for Reservations functionality
describe("Reservations", () => {
  // Test: Check complete reservation flow (create → confirm → check availability)
  test("customer can create reservation; staff can confirm; available tables excludes reserved", async () => {
    // Step 1: Create admin and staff users (staff will confirm the reservation)
    const adminAgent = createAgent();
    await createAdmin(adminAgent, { email: "admin_res@example.com" });
    await createStaff(adminAgent, { email: "staff_res@example.com" });

    // Step 2: Staff logs in to get authentication cookie
    const staffAgent = createAgent();
    const staffLogin = await staffAgent.post("/api/auth/login").send({
      email: "staff_res@example.com",
      password: "123456",
    });
    expect(staffLogin.status).toBe(200);

    // Step 3: Create a customer user
    const customerAgent = createAgent();
    await createCustomer(customerAgent, { email: "customer_res@example.com" });

    // Step 4: Set reservation details (date, time, party size)
    const reservation_date = "2025-12-20";
    const reservation_time = "18:00";

    // Step 5: Customer creates a reservation for table 3
    const createRes = await customerAgent.post("/api/reservations").send({
      table_number: 3,
      reservation_date,
      reservation_time,
      party_size: 2, // 2 people
    });
    
    // Verify reservation was created successfully (status 201 = created)
    expect(createRes.status).toBe(201);
    expect(createRes.body.table_number).toBe(3);
    expect(createRes.body.status).toBe("pending"); // New reservations start as "pending"

    // Step 6: Get the reservation ID (needed to confirm it)
    const resId = createRes.body.reservation_id || createRes.body._id;

    // Step 7: Staff confirms the reservation (changes status from "pending" to "confirmed")
    const confirmRes = await staffAgent.patch(`/api/reservations/${resId}/confirm`);
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.reservation.status).toBe("confirmed");

    // Step 8: Check available tables for the same date and time
    // Table 3 should NOT be in the available list because it's already reserved
    const availableRes = await customerAgent.get(
      `/api/reservations/available-tables?reservation_date=${reservation_date}&reservation_time=${reservation_time}`
    );
    expect(availableRes.status).toBe(200);
    
    // Verify table 3 is NOT in the available tables list (it's reserved!)
    expect(availableRes.body.availableTables).not.toContain(3);
  });
});
