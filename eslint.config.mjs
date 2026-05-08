import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),

  {
    rules: {
      // 🔥 Disable overly aggressive React rule
      "react-hooks/set-state-in-effect": "off",

      // (Optional sanity tweaks — uncomment if needed)
      // "@typescript-eslint/no-explicit-any": "warn",
      // "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
]);
