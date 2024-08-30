---
sidebar_position: 4
sidebar_label: Testing
---

# Testing

In this document, you will find everything about test automation tools we use.

## Functional Testing

### Unit tests

For unit testing we use [Tap](https://node-tap.org/) which uses the test anything protocol and includes many useful features such as code coverage, test reporting and Typescript support out of the box.

### End to end testing

#### UI Testing

For UI e2e testing we use [Playwright](https://playwright.dev/) ...

#### API Testing

For API e2e testing we use [Bruno](https://www.usebruno.com/). It has a Postman like [client](https://www.usebruno.com/downloads) which can be used to manually test endpoints by pointing at a folder containing bruno files. Unlike Postman which stores all collections in it cloud, Bruno stores collections locally and are shared via source control. In addition collections can contain assertions and other tests on endpoints which can be run as tests via the Bruno CLI. Any postman collections we have can be converted to Bruno collcections via the Bruno client and new requests can be created via the client or directly in code as per the [documentation](https://docs.usebruno.com/).

## Non-Functional Testing

### Accessibility Testing

[Axe](https://www.deque.com/axe/)

### Visual Testing

[Chromatic](https://www.chromatic.com/) 

### Performance Testing

For front end performance tests we are using [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) which also covers basic accessibility testing. For navigation between pages we are using [Puppeteer](https://pptr.dev/) as both tools are from Google and designed to integrate easily.

For back end performance testing we are looking at [K6](https://k6.io/)

## Testing in CICD

We are starting to add testing to our pipelines, as not all apps have e2e or unit tests we have added an echo comment to the package.json file so we can use a common pipeline for all projects without pipelines failing because the command does not exist for the app. Initially we have UI tests for payments and at least 1 test for most API projects (excluding upload and mock api).

Current commands used and mapped to the shared building block pipelines:
"test:smoke:e2e" - used for smoke tests on depolyment to develop (staging comming soon) 
"test:regression:e2e" - runs all tests overnight against develop (comming soon)
"test" - runs unit tests (not yet implemented in all projects or in the pipeline)

Next steps:
- UI tests for other projects using the 'playwright.config.ts' based on the payments app version and updating the above commands to match the version in payments
- unit tests running