/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    port: 5173,
    host: true,
  },

  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
    },
  },
  test: {
    coverage: {
      provider: "v8", // Ensure V8 is used
      include: ["src/**"],
      exclude: [
        "src/components/DesignToggler",
        "src/**/*.css",
        "src/main.tsx",
        "src/App.tsx",
        "*.context.tsx",
        "*.schema.ts",
        "__fixtures__",
        "exceptions/**",
        "domain/entities/**",
        "infrastructure/dtos/**",
      ],
    },
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests.ts",
    css: true,
  },
});
