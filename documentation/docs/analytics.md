---
sidebar_position: 5
sidebar_label: Analytics
---

# Analytics

This document will describe the integration flow of the Matomo analytics system into NextJS and Fastify applications.

## Matomo instance

### Local instance

We don't currently have support for running Matomo locally, but this will be possible in the future.

### Hosted instance

We have only one hosted Matomo instance, which we will use in every application. The instance is hosted on `https://analytics.ogcio.gov.ie`.

## Analytics package

Our custom shared package, `Analytics`, helps us integrate Matomo. The package uses the `@socialgouv/matomo-next` module for the integration; however, since this module is not well maintained, we are planning to replace it with a custom SDK.

The Analytics package exposes an `init` and a `sendAnalytics` method to send custom events programmatically. The `sendAnalytics` method can be used on the front end and back end as well.

It also has some React components (client components) that we can easily use to set up basic tracking with Matomo.

> Since the implemented components are client components, they won't work if the user has JavaScript disabled in their browser. These components are only the front-end integration of the `init` and `sendAnalytics` methods, which can also be used on the server side. Before starting to use the front-end components, analyze the situation to make sure that tracking will be possible on the front end or that it is not mandatory if the user doesn't allow JavaScript execution on their side; another way, please only use the exposed methods and implement the integration on server-side.

### The AnalyticsTracker component

This component must be placed in the page's layout at the top, right after the opening Body tag. It can take two optional parameters:
- **userId**: this information can be sensitive; if used, it must comply with GDPR, and no sensitive data can be accessed based on this ID. This ID should not be a **PII** (Personally identifiable information), like `MyGovId`.
- **customDimensions**: It is a custom attribute; we can have as many dimensions as we want. However, the current limit is 40 (dimension1 - dimension40). These attributes describe specific characteristics within your Matomo table report. Typically, dimensions are displayed in the first column of the report and provide context to the metrics.

### The AnalyticsEvent component

This component has to be added to every other page component. It will send an event to Matomo every time it gets re-rendered, allowing us to track navigation and page visits.

## Integration

First, you must configure the Matomo server's URL and site ID. To get a site ID, you must register your application in Matomo. This can only be done by the admins! Please contact the dev team for support.

Create a `.env` file in your application's root folder and set the following variables in it (do not forget to change `<YOUR_SITE_ID>` to your actual site id):

Local `.env` file:
```
NEXT_PUBLIC_MATOMO_URL=//analytics.ogcio.gov.ie
NEXT_PUBLIC_MATOMO_SITE_ID=<YOUR_SITE_ID>
NEXT_PUBLIC_MATOMO_PROTOCOL=https
```

In the case of NextJS, update your Next configuration and add `analytics` to the transpilePackages section:

`next.config.mjs`
```
const nextConfig = {
    transpilePackages: [
        ...,
        "analytics"
    ],
    ...
}
```

Add the `analytics` package to your `package.json` as a dependency. You can use `*` instead of specifying a fixed version:
```
 ...
 "dependencies": {
    "analytics": "*",
    ...
 }
 ...
```

Build your project with your updated dependencies.

After everything is set up, we can integrate the `AnalyticsTracker` component into our `layout`.

`your_app/layout.tsx`
```
import AnalyticsTracker from "analytics/components/AnalyticsTracker";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <body>
                {/* MATOMO ANALYTICS TRACKER */}
                <AnalyticsTracker></AnalyticsTracker>

                {children}
            </body>
        </html>
    )
}
```

Once all the above are implemented, you should be done with the basic integration of Matomo. This will track only user visits, but navigation is not necessary since the layout is cached and won't be re-rendered on navigation. Please use the `AnalyticsEvent` component and the `sendAnalytics` method to extend your statistics with custom events.
