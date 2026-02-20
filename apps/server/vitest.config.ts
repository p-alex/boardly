import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8", // or 'v8',
      exclude: [
        "**/index.ts",
        "src/config.ts",
        "src/interfaces/routers",
        "dist",
        "generated",
        "**.schema.ts",
      ],
    },
    globals: true,
    environment: "node",
    setupFiles: "src/setupTests.ts",
  },
});
