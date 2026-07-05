import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"

export default defineConfig([
  {
    ignores: [
      "**/.medusa/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/.cache/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
    ],
  },

  ...medusa.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
])