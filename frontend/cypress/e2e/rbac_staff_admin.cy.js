describe("RBAC (staff vs admin)", () => {
  const apiBase = "http://localhost:3000";

  const ts = Date.now();
  const admin = { name: "Admin", email: `admin_rbac_${ts}@example.com`, password: "123456", role: "admin" };
  const staff = { name: "Staff", email: `staff_rbac_${ts}@example.com`, password: "123456" };

  before(() => {
    // Create admin + login via API.
    cy.request("POST", `${apiBase}/api/auth/register`, admin).its("status").should("eq", 201);
    cy.request("POST", `${apiBase}/api/auth/login`, { email: admin.email, password: admin.password })
      .its("status")
      .should("eq", 200);

    // Create staff via admin endpoint.
    cy.request("POST", `${apiBase}/api/users/staff`, staff).its("status").should("eq", 201);
  });

  beforeEach(() => {
    // Ensure tests don't accidentally reuse the admin cookie from API seeding.
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it("staff can access shared staff/admin pages, but cannot access admin-only pages", () => {
    cy.visit("/login");
    cy.get("#email").type(staff.email);
    cy.get("#password").type(staff.password);
    cy.contains("button", "Sign In").click();
    cy.contains("button", "Logout").should("be.visible");

    // Shared route should work
    cy.visit("/admin/orders");
    cy.contains(/Orders/i).should("be.visible");

    // Admin-only route should redirect to Unauthorized
    cy.visit("/admin/users");
    cy.url().should("include", "/unauthorized");
    cy.contains(/Access Denied/i).should("be.visible");
  });
});


