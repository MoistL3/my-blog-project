import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

const eslintConfig = defineConfig([
  ...compat.config({ extends: ["next/core-web-vitals", "next/typescript"] }),
  { rules: { "react/jsx-no-comment-textnodes": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
