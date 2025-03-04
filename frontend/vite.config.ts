/// <reference types="node" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5035",
          changeOrigin: true,
        },
        "/uploads": {
          target: env.VITE_API_URL || "http://localhost:5035",
          changeOrigin: true,
        },
      },
    },
    build: {
      sourcemap: mode !== "production", // Disable sourcemaps in production for smaller bundles
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
  };
});
