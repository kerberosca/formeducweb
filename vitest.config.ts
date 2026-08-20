import path from "node:path";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "next/server": path.resolve(__dirname, "node_modules/next/server.js")
    }
  },
  test: {
    environment: "jsdom",
    globalSetup: ["./vitest.global.ts"],
    setupFiles: ["./vitest.setup.ts"],
    exclude: [...configDefaults.exclude, "e2e/**"],
    fileParallelism: false,
    restoreMocks: true,
    clearMocks: true,
    server: {
      deps: {
        inline: [/next-auth/, /@auth\/core/]
      }
    }
  }
});
