# Playwright Tests with TypeScript

This repository contains end-to-end tests for a web application using Playwright and TypeScript. The tests are organized using the Page Object Model (POM) to enhance maintainability and readability.

## Getting Started

### Prerequisites

- Node.js (>=14.x)
- npm (>=6.x)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-repo/playwright-tests.git
    cd playwright-tests
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

### Running Tests

To run all tests, use the following command:
```sh
npx playwright test

npx playwright test --grep @critical


## Playwright Configuration

The Playwright configuration is defined in the `playwright.config.ts` file. Here are some key points:

- **Timeout per test**: Each test has a timeout of 5000 milliseconds.
- **Reporters**: The tests use line, allure-playwright, and HTML reporters.
- **Test directory**: The tests are located in the `e2e` directory.
- **Retries**: Tests will be retried once if they fail.
- **Artifacts**: Test results, including screenshots and traces, are stored in the `test-results` directory.
- **Web Server**: The configuration includes a command to start the development server before running the tests.
- **Base URL**: The base URL for the application under test is set dynamically based on the port.

For more information on configuring Playwright, visit the [official documentation](https://playwright.dev/docs/test-configuration).

### Running Tests

To run all tests, use the following command:
```sh
npm run test:e2e ```

To run tests with a visual\debug interface:
```sh
npm run test:visual ```

To run tests in headed mode:

```sh
npm run test:head```

To run only critical tests in headed mode:

```sh
npm run test:critical```

To run only blocker tests in headed mode:

```sh
npm run test:blocker```

To run a specific test file or test case:

```sh
npm run test:single ```

## Resources

- [Playwright Official Website](https://playwright.dev)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

For further details and advanced usage, please refer to the Playwright and TypeScript official documentation.


