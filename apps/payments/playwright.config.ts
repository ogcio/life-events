import { defineConfig, devices } from "@playwright/test";
import { testPlanFilter } from "allure-playwright/testplan";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const baseURL =
  process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT ??
  "http://localhost:3001";

export default defineConfig({
  timeout: 500000,
  grep: testPlanFilter(),
  reporter: [["line"], ["allure-playwright"], ["html"]], // Test directory
  testDir: path.join(__dirname, "e2e"),
  retries: 0,
  outputDir: "./e2e/test-results/",

  // webServer: {
  //   command: "npm run start:logto",
  //   cwd: "../../",
  //   url: baseURL,
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  // },

  use: {
    baseURL,
    trace: "retry-with-trace",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { slowMo: 1000 },
      },
    },
  ],
});
