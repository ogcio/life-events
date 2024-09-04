import { defineConfig, devices } from "@playwright/test";
import { testPlanFilter } from "allure-playwright/testplan";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const baseURL = process.env.BASE_URL;

export default defineConfig({
  timeout: 500000,
  grep: testPlanFilter(),
  reporter: [
    ["line"],
    ["allure-playwright"],
    ["html", { open: "never" }],
    ["junit", { outputFile: "./e2e/test-results/results.xml" }],
  ], // Test directory
  testDir: path.join(__dirname, "e2e"),
  retries: 0,
  outputDir: "./e2e/test-results/",

  // uncomment if you want to spin up services and dependencies upon starting the test process
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
