// Jest loads this before any test files. Keep it side-effect free other than env vars.
process.env.NODE_ENV = "test";
process.env.SECRET_KEY = process.env.SECRET_KEY || "test_secret_key";
process.env.ORIGIN = process.env.ORIGIN || "http://localhost:5173";

// Stripe is instantiated at import-time in `controllers/paymentController.js`
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_dummy";

// Email is used by nodemailer in auth + observer. We'll mock nodemailer in setup.
process.env.EMAIL_USER = process.env.EMAIL_USER || "test@example.com";
process.env.EMAIL_PASS = process.env.EMAIL_PASS || "test_password";

// Default test DB URL (expects local MongoDB). Override via TEST_DB_URL if needed.
process.env.TEST_DB_URL =
  process.env.TEST_DB_URL || "mongodb://127.0.0.1:27017/YallaEat_test_db";


