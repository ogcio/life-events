import { defineConfig, devices } from "@playwright/test";
import { testPlanFilter } from "allure-playwright/testplan";
import path from "path";

// Use process.env.PORT by default and fallback to port 3000 {{for local running}}
const PORT = process.env.PORT || 3000;

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `https://dev.life.gov.ie`;

// Reference: https://playwright.dev/docs/test-configuration
export default defineConfig({
  // Timeout per test
  timeout: 100000,
  grep: testPlanFilter(),
  reporter: [["line"], ["allure-playwright"], ["html"]], // Test directory
  testDir: path.join(__dirname, "e2e"),
  // If a test fails, retry it additional 2 times
  retries: 0,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: "test-results/",

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: "npm run dev",
    url: baseURL,
    timeout: 8000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Retry a test if its failing with enabled tracing. This allows you to analyze the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: "retry-with-trace",
    screenshot: "only-on-failure",

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    // contextOptions: {
    //   ignoreHTTPSErrors: true,
    // },
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
