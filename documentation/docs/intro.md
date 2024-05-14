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
| ------------------------ | ----------------------- |
| web (Life events portal) | `http://localhost:3000` |
| payments                 | `http://localhost:3001` |
| messages                 | `http://localhost:3002` |
| profile                  | `http://localhost:3003` |
| auth-service             | `http://localhost:3005` |
| logto admin console      | `http://localhost:3302` |
| logto apis               | `http://localhost:3301` |

APIs

| API Name     | URL                     |
| ------------ | ----------------------- |
| mock-api     | `http://localhost:8000` |
| payments-api | `http://localhost:8001` |
| messages-api | `http://localhost:8002` |
| profile-api  | `http://localhost:8003` |
| timeline-api | `http://localhost:8004` |

## Localisation

Translation files are stored in /web/messages. Localisation works on React server components and it uses [next-intl](https://next-intl-docs.vercel.app/)

## Logto integration

The only app that supports logto at the present time is payments. in order to allow using logto it is required to setup the following .env keys

```
LOGTO_APP_ID=logto_app_id
LOGTO_ENDPOINT=http://localhost:3301/
LOGTO_APP_SECRET=logto_app_secret
LOGTO_COOKIE_SECRET=logto_cookie_secret
LOGTO_BASE_URL=http://localhost:3001

```

To retrieve the ids and secrets you need to access the logto interface http://localhost:3302

in the `Applications` section you can retrieve `LOGTO_APP_ID` and `LOGTO_APP_SECRET` for the application you are willing to configure.

the `LOGTO_COOKIE_SECRET` can be retrieved in the `Signinig keys` section

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

next.js has been configured to use `standalone` mode for the `web` app. If this is working as expected we will be adopting this change
to other apps as well, for info about standalone mode, please refer to the [doc](https://nextjs.org/docs/pages/api-reference/next-config-js/output)
in order to allow standalone mode to work with the monorepo, the experimental `outputFileTracingRoot` needs to be used.
Once the build is done, only the standalone static app can be deployted to the docker runner image.
the static folder needs to be moved under the app path after build as per Next.js docs:

```
Additionally, a minimal server.js file is also output which can be used instead of next start.
This minimal server does not copy the public or .next/static folders by default as these should
ideally be handled by a CDN instead, although these folders can be copied to the standalone/public
and standalone/.next/static folders manually, after which server.js file will serve these automatically.
```

with standalone mode the app can be run with a plain `node server.js` command instead of relying on `npm` and `next`
