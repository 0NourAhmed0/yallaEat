import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1", // explicit IP for Windows host resolution
    port: 5173,
    strictPort: true, // keep Cypress baseUrl stable; fail loudly if the port is taken
    proxy: {
      // Proxy backend API in dev so cookies work same-origin.
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
