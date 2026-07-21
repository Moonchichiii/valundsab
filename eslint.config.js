import js from "@eslint/js";

const nodeGlobals = {
  Buffer: "readonly",
  URL: "readonly",
  console: "readonly",
  module: "writable",
  process: "readonly",
  require: "readonly",
};

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: {
      "no-console": ["error", { allow: ["error", "warn"] }],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: nodeGlobals,
    },
    rules: {
      "no-console": ["error", { allow: ["error", "warn"] }],
    },
  },
];
