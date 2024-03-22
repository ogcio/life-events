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
      name: "setup auth",
      testMatch: "auth.ts",
    },
    // {
    //   name: "Desktop Chrome",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     storageState: 'e2e/.auth/user.json',
    //   },
    //   dependencies: ['setup auth'],
    // },
    // {
    //   name: 'Desktop Firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: 'e2e/.auth/user.json',
    //   },
    //   dependencies: ['setup auth'],
    // },
    // {
    //   name: 'Desktop Safari',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: 'e2e/.auth/user.json',
    //   },
    //   dependencies: ['setup auth'],
    // },
    // {
    //   name: "Mobile Chrome",
    //   use: {
    //     ...devices["Pixel 5"],
    //     storageState: 'e2e/.auth/user.json',
    //   },
    //   dependencies: ['setup auth'],
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 12"],
    //     storageState: 'e2e/.auth/user.json',
    //   },
    //   dependencies: ['setup auth'],
    // },
  ],
});
