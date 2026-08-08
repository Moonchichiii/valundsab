import js from "@eslint/js";

const nodeGlobals = {
  Buffer: "readonly",
  URL: "readonly",
  console: "readonly",
  fetch: "readonly",
  setTimeout: "readonly",
  module: "writable",
  process: "readonly",
  require: "readonly",
};

const browserGlobals = {
  PerformanceObserver: "readonly",
  document: "readonly",
  getComputedStyle: "readonly",
  window: "readonly",
};

export default [
  { ignores: ["dist/**", ".wrangler/**"] },
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
    files: ["apps/web/**/*.js"],
    languageOptions: {
      globals: {
        ...browserGlobals,
        localStorage: "readonly",
        requestAnimationFrame: "readonly",
        navigator: "readonly",
        clearTimeout: "readonly",
        setTimeout: "readonly",
      },
    },
  },
  {
    files: ["functions/**/*.js"],
    languageOptions: {
      globals: {
        Request: "readonly",
        AbortSignal: "readonly",
        Response: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        console: "readonly",
        fetch: "readonly",
      },
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...browserGlobals,
        Request: "readonly",
        Response: "readonly",
        URLSearchParams: "readonly",
        globalThis: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        HTMLElement: "readonly",
        getComputedStyle: "readonly",
      },
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
