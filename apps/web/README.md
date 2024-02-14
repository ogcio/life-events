# Next.js + Playwright

This example shows how to configure Playwright to work with Next.js.

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example) or preview live with [StackBlitz](https://stackblitz.com/github/vercel/next.js/tree/canary/examples/with-playwright)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-playwright&project-name=with-playwright&repository-name=with-playwright)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example with-playwright with-playwright-app
```

```bash
yarn create next-app --example with-playwright with-playwright-app
```

```bash
pnpm create next-app --example with-playwright with-playwright-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

## Note on next design system

Currently the next design system is not registered on npm thus the preferred way of installing it is by using [yalc](https://github.com/wclr/yalc).

Make sure to build and yalc publish the design system, and yalc add in the web app directory.