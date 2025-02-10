import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5035",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5035",
        changeOrigin: true,
      },
    },
  },
});
