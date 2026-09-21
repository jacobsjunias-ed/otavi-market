import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Vite only inlines env vars prefixed with VITE_ at build time.
  // Production API host comes from VITE_API_URL (see src/api.js).
  // This proxy is local `vite` only — it is not used on Vercel.
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
