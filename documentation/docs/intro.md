---
sidebar_position: 1
sidebar_label: Get started
---

# Life Events Platform

Welcome in the Life Events Platform, using the [OGCIO](https://www.ogcio.gov.ie/) building blocks.

The platform follows a mono-repo architecture.
The OGCIO design system requires a wrapper for usage within NextJS. This is done to ensure seamless integration of the design system while preserving the progressive enhancement capabilities.

Most building blocks and 3rd party services are mocked in this mono-repo.

Testing around RSC and RSA is still poorly supported. We use Playwright for e2e testing and Tap for unit testing. At the moment there isn't a solid integration testing library for async React components

## Setup

This repo requires:

- NodeJS LTS
- Docker (Linux/OSX env)

In order to run the setup you must:

- Clone the repo
- if you have nvm installed run `nvm use`, otherwise ensure you're running Node LTS
- ensure that `docker` is running
- run `npm start` to start the supporting docker services and run our services in 'dev' mode. If the docker services are already running you can just run `npm run start:services`

Service URLs

| Service Name             | URL                     |
|--------------------------|-------------------------|
| web (Life events portal) | `http://localhost:3000` |
| payments                 | `http://localhost:3001` |
| messages                 | `http://localhost:3002` |
| profile                  | `http://localhost:3003` |
| mock-api                 | `http://localhost:8000` |
| logto admin console      | `http://localhost:3302` |
| logto apis               | `http://localhost:3301` |

## Localisation

Translation files are stored in /web/messages. Localisation works on React server components and it uses [next-intl](https://next-intl-docs.vercel.app/)

## Docker build

To build the images for the apps you have to build the base images before (following are the commands from the root folder)

```
docker build -t base-deps:latest  --file Dockerfile .
docker build -t design-system-container:latest --file packages/design-system/Dockerfile .
```

Then you can build the app image from the root folder

```
docker build -t web-container:latest --file apps/web/Dockerfile .
```
