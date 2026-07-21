import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:8000",
  },
  webServer: {
    command: "bun scripts/serve.mjs",
    url: "http://127.0.0.1:8000",
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
