const request = require("supertest");

const app = require("../app");

function createAgent() {
  return request.agent(app);
}

async function register(agent, { name, email, password, role } = {}) {
  const payload = {
    name: name || "Test User",
    email: email || `user_${Date.now()}@example.com`,
    password: password || "123456",
  };
  if (role) payload.role = role;

  const res = await agent.post("/api/auth/register").send(payload);
  return { res, payload };
}

async function login(agent, { email, password } = {}) {
  const res = await agent.post("/api/auth/login").send({
    email,
    password: password || "123456",
  });
  return res;
}

async function createAdmin(agent, overrides = {}) {
  const email = overrides.email || `admin_${Date.now()}@example.com`;
  const password = overrides.password || "123456";
  await register(agent, {
    name: overrides.name || "Admin",
    email,
    password,
    role: "admin",
  });
  return { email, password };
}

async function createCustomer(agent, overrides = {}) {
  const email = overrides.email || `customer_${Date.now()}@example.com`;
  const password = overrides.password || "123456";
  await register(agent, {
    name: overrides.name || "Customer",
    email,
    password,
    role: "customer",
  });
  return { email, password };
}

async function createStaff(adminAgent, overrides = {}) {
  const payload = {
    name: overrides.name || "Staff",
    email: overrides.email || `staff_${Date.now()}@example.com`,
    password: overrides.password || "123456",
  };

  const res = await adminAgent.post("/api/users/staff").send(payload);
  return { res, payload };
}

async function createMenuItem(adminOrStaffAgent, overrides = {}) {
  const payload = {
    name: overrides.name || "Burger",
    description: overrides.description || "Tasty",
    price: overrides.price ?? 50,
    category: overrides.category || "Main",
  };

  const res = await adminOrStaffAgent.post("/api/menu-items").send(payload);
  return { res, payload };
}

module.exports = {
  app,
  createAgent,
  register,
  login,
  createAdmin,
  createCustomer,
  createStaff,
  createMenuItem,
};


