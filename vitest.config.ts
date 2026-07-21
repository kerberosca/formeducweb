import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  },
  test: {
    environment: "jsdom",
    globalSetup: ["./vitest.global.ts"],
    setupFiles: ["./vitest.setup.ts"],
    fileParallelism: false,
    restoreMocks: true,
    clearMocks: true
  }
});
