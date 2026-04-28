import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: [
      "./tests/setup/global.setup.ts",
      "./tests/setup/react.setup.ts",
    ],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "app/**/*.ts",
        "app/**/*.tsx",
        "components/**/*.tsx",
        "controllers/**/*.ts",
        "lib/**/*.ts",
        "models/**/*.ts",
        "services/**/*.ts",
        "next.config.ts",
        "proxy.ts",
      ],
      exclude: ["**/*.d.ts"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
