describe("Customer happy path", () => {
  const apiBase = "http://localhost:3000";

  const ts = Date.now();
  const admin = { name: "Admin", email: `admin_${ts}@example.com`, password: "123456", role: "admin" };
  const customer = { name: "Customer", email: `customer_${ts}@example.com`, password: "123456" };

  before(() => {
    // Seed data via backend API (no UI for admin creation).
    cy.request("POST", `${apiBase}/api/auth/register`, admin).its("status").should("eq", 201);

    // Login as admin via API to set backend cookie for this origin, then create a menu item.
    cy.request("POST", `${apiBase}/api/auth/login`, {
      email: admin.email,
      password: admin.password,
    }).its("status").should("eq", 200);

    cy.request("POST", `${apiBase}/api/menu-items`, {
      name: `Burger ${ts}`,
      description: "Tasty",
      price: 50,
      category: "Main",
    }).its("status").should("eq", 201);

    // Create customer (UI will login later).
    cy.request("POST", `${apiBase}/api/auth/register`, customer).its("status").should("eq", 201);
  });

  beforeEach(() => {
    // Avoid leaking cart/login state between specs/runs.
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  // User Story: As a customer, I want to view the menu, add items to my cart, and place an order.
  it("logs in, adds menu item to cart, and checks out to create an order", () => {
    cy.visit("/login");
    cy.get('input#email').type(customer.email);
    cy.get('input#password').type(customer.password);
    cy.contains("button", "Sign In").click();
    cy.contains("button", "Logout").should("be.visible");

    // Navigate to menu
    cy.visit("/menu");
    cy.contains(/Delicious Dishes Await/i).should("be.visible");
    cy.contains(new RegExp(`Burger\\s*${ts}`)).should("be.visible");

    // Add to cart for the seeded item (avoid clicking the wrong card if DB already has items)
    cy.contains(new RegExp(`Burger\\s*${ts}`))
      .closest(".menu-card-compact")
      .within(() => {
        cy.contains("button", "Add to cart").click();
      });
    cy.url().should("include", "/cart");
    cy.contains(new RegExp(`Burger\\s*${ts}`)).should("be.visible");

    // Checkout
    cy.contains("button", "Checkout").click();
    cy.url().should("include", "/orders");
    cy.contains(/Order History/i).should("be.visible");
  });
});


