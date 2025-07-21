import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["api/utils/db.js", "mongoose"],
  },
  // Optionally, add this to prevent Vite from trying to serve api/ as static files:
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
    fs: {
      allow: ["src", "public", "backend"], // do not include 'api'
    },
  },
});
