import { defineConfig, devices } from "@playwright/test";
import { testPlanFilter } from "allure-playwright/testplan";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env for local development
dotenv.config();

// Use process.env.PORT by default and fallback to port 3000 for local running
const PORT = process.env.PORT || 3000;
const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  timeout: 500000,
  grep: testPlanFilter(),
  reporter: [["line"], ["allure-playwright"], ["html"]],
  testDir: path.join(__dirname, "e2e"),
  retries: 0,
  outputDir: "test-results/",

  webServer: {
    command: process.env.COMMAND || "npm run dev",
    url: baseURL,
    timeout: 8000,
    reuseExistingServer: !process.env.CI,
  },

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
