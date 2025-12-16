const mongoose = require("mongoose");

// Prevent real emails from being sent during tests.
jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: jest.fn().mockResolvedValue({ accepted: ["test@example.com"] }),
  }),
}));

beforeAll(async () => {
  jest.setTimeout(30000);
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.TEST_DB_URL);
  }
});

afterEach(async () => {
  // Clean DB between tests for determinism.
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});


