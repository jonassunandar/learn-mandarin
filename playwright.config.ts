import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:3000",
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1,
    hasTouch: true,
    trace: "retain-on-failure",
  },
  reporter: "list",
});
