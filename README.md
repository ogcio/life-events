# Mono Repo Starter Kit
NextJS app starter kit, using the [OGCIO](https://www.ogcio.gov.ie/) building blocks.

The starter kit follows a mono repo architecture. It's up to the dev teams involved to eventually evolve or replace these services with production ready APIs.
The OGCIO design system requires a wrapper for usage within NextJS. This is done to ensure seamless integration of the design system while preserving the progressive enhancement capabilities.

All building blocks and 3rd party services are mocked in this monorepo. 

Testing around RSC and RSA is still poorly supported. We use Playwright for e2e testing and Jest for unit testing. At the moment there isn't a solid integration testing library for async React components 

# Setup
This repo requires:
    - NodeJS LTS
    - Docker (Linux/OSX env)

- Clone the repo 
- if you have nvm installed run `nvm use`, otherwise ensure you're running Node LTS
- run `npm ci`
- run `npm start`

This should start several docker containers using docker-compose. 

Visit http://web.localtest.me/ 

# Localisation

Translation files are stored in /web/messages. Localisation works on React server components and it uses [next-intl](https://next-intl-docs.vercel.app/)