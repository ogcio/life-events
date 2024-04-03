---
sidebar_position: 1
sidebar_label: Get started
---

# Life Events Platform

Welcome in the Life Events Platform, using the [OGCIO](https://www.ogcio.gov.ie/) building blocks.

The platform follows a mono-repo architecture.
The OGCIO design system requires a wrapper for usage within NextJS. This is done to ensure seamless integration of the design system while preserving the progressive enhancement capabilities.

Most building blocks and 3rd party services are mocked in this mono-repo.

Testing around RSC and RSA is still poorly supported. We use Playwright for e2e testing and Jest for unit testing. At the moment there isn't a solid integration testing library for async React components

## Setup

This repo requires:

- NodeJS LTS
- Docker (Linux/OSX env)

In order to run the setup you must:

- Clone the repo
- if you have nvm installed run `nvm use`, otherwise ensure you're running Node LTS
- Copy `.env.sample` to `.env` and update the variables for all apps
- run `npm run build:ds` to build the design system.
- run `npm start` to start the supporting docker services and run our services in 'dev' mode. If the docker services are already running you can just run `npm run start:services`

Service URLs

- web (Life events portal) - `localhost:3000`
- payments - `localhost:3001`
- messages - `localhost:3002`
- mock-api - `localhost:8000`

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
