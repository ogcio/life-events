# Life Events Platform

Welcome to the Life Events Platform, using the [OGCIO](https://www.ogcio.gov.ie/) building blocks.
This repository contains the Live Events application and two Building Blocks: Messaging and Payments.

To read more about the project you can refer to the [Documentation](documentation/docs/) folder.
You can start by reading the [Introduction](documentation/docs/intro.md) which contains the Setup to run this project locally.

In case you want a more interactive experience you can start our web-based documentation just by running: `npm i && npm start:docs`.

The docs application will start usually at `http://localhost:3000`. From there you can setup this repo and read all the technical docs

## Bearer Integration

[Bearer](https://docs.bearer.com/quickstart/) is integrated into our application's pipeline to enhance security and privacy by monitoring API usage and ensuring compliance with data protection regulations.

### Pipeline Integration

Bearer has been added as a step in our CI/CD pipeline. This step performs the following tasks:
- Monitors API calls made by our application.
- Ensures compliance with data protection regulations.
- Fails the pipeline if any critical or high issues are found.

### Running Bearer Reports Locally

To facilitate local development and testing, npm commands that allow you to run Bearer reports locally.

#### Prerequisites

Before running Bearer reports locally, ensure you have the following installed:
- Node.js (>=14.x)
- npm (>=6.x)
- Bearer CLI (follow the [installation instructions](https://docs.bearer.com/quickstart/))

#### NPM Commands

The following npm commands are available for running Bearer reports locally:

- **Run Bearer Scan**: This command runs the Bearer audit and generates an report `bearer-scan-report.html`.

  ```sh
  make security-scan
  ```

- **Generate privacy report**: This command generates an HTML privacy report `bearer-privacy-report.html`.

  ```sh
  make security-privacy-report
  ```