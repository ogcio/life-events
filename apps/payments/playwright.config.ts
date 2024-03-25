import { defineConfig, devices } from "@playwright/test";
import path from "path";

const baseURL = process.env.HOST_URL ?? "http://localhost:3001";

export default defineConfig({
  timeout: 30 * 1000,
  testDir: path.join(__dirname, "e2e"),
  retries: 1,
  outputDir: "./e2e/test-results/",
  use: {
    baseURL,
    trace: "retry-with-trace",
    video: "retain-on-failure",
  },
  reporter: process.env.CI
    ? [["github"], ["blob"]]
    : [["list"], ["html", { outputFolder: "./playwright/playwright-report" }]],
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "Desktop Firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "Desktop Safari",
      use: {
        ...devices["Desktop Safari"],
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
      },
    },
  ],
});
