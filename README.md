# Life Events Platform

Life Events Platform, using the [OGCIO](https://www.ogcio.gov.ie/) building blocks.

The platform follows a mono repo architecture.
The OGCIO design system requires a wrapper for usage within NextJS. This is done to ensure seamless integration of the design system while preserving the progressive enhancement capabilities.

Most building blocks and 3rd party services are mocked in this monorepo.

Testing around RSC and RSA is still poorly supported. We use Playwright for e2e testing and Jest for unit testing. At the moment there isn't a solid integration testing library for async React components

## Setup
This repo requires:
    - NodeJS LTS
    - Docker (Linux/OSX env)
    - TrueLayer account - Follow the steps [below](#true-layer-setup) to create your console account and get your credentials

Once you've setup your TrueLayer console account, add the following URL to the 'Allowed redirect URIs' section of the settings page

```
http://web.localtest.me/en/paymentRequest/complete
```

- Clone the repo
- if you have nvm installed run `nvm use`, otherwise ensure you're running Node LTS
- Copy `.env.sample` to `.env` and update the variables with the values you've gotten from TrueLayer
- run `npm ci`
- run `npm start`

This should start several docker containers using docker-compose.

Visit http://web.localtest.me/

## Localisation

Translation files are stored in /web/messages. Localisation works on React server components and it uses [next-intl](https://next-intl-docs.vercel.app/)

## True Layer Setup

- Follow the instructions to setup a console account and create an app [here](https://docs.truelayer.com/docs/quickstart-create-a-console-account)
- You should now have your client_id and client_secret values
- Then follow [these steps](https://docs.truelayer.com/docs/quickstart-make-a-payment#generate-keys) to generate your public and private keys
- [Upload your public key to the True Layer Console](https://docs.truelayer.com/docs/quickstart-make-a-payment#upload-your-public-key-to-console-and-create-a-merchant-account)
- Add our redirect URI to the True layer console - `http://web.localtest.me/en/paymentRequest/complete`
- Follow [these steps](https://docs.truelayer.com/docs/quickstart-make-a-payment#format-your-private-key) to format your private key so it can be used within an environment variable
