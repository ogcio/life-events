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

[K6](https://k6.io/)