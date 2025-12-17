import { defineConfig } from "cypress";

const baseUrl = process.env.CYPRESS_BASE_URL || "http://localhost:5173";

export default defineConfig({
  e2e: {
    baseUrl,
    video: false,
  },
});


