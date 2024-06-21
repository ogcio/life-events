---
sidebar_position: 5
sidebar_label: Analytics
---

# Analytics

This document will describe the integration flow of the Matomo analytics system into NextJS and Fastify applications.

## Matomo instance

### Local instance

At this moment we don't have support to run Matomo locally. This will be possible in the future.

### Hosted instance

We have only one hosted Matomo instance, which we will use in every of our applications. The instance is hosted on `https://analytics.ogcio.gov.ie`.

## Analytics package

We have a custom shared package, called `Analytics`, which helps us integrate Matomo. The package is using the `@socialgouv/matomo-next` module for the integration, however, since this module is not well maintained, we are planning changing it with a custom SDK.

The Analytics package exposes an `init` and a `sendAnalytics` method to send custom event programatically. The sendAnalytics method can be used on the front-end and backend as well.

Also, it has some React components that we can use to easily set up basic tracking with Matomo.

### The AnalyticsTracker component

This component has to be places in the page's layout, in the top right after the opening Body tag. It can take two optional parameters:
- userId: this information can be sensitive, if it is used, it must be compliant with GDPR and no sensitive data could be accessed based on this ID. That means, this ID should not be a PII (Personally identifiable information), like MyGovId.
- customDimensions: It is a custom attribute, we can have as many dimensions as we want, however, the current limit is 40 (dimension1 - dimension40). These attributes describe specific characteristics within your Matomo table report. Typically, dimensions are displayed in the first column of the report and provide context to the metrics.

### The AnalyticsEvent component

This compon

## Integration

First, you will need to configure the Matomo server's url and your site ID. In order to get a site ID, you have to register your application in Matomo. This can be done by the admins only!

Create a `.env` file in your application's root folder and set the following variables in it (do not forget to change `<YOUR_SITE_ID>` to your real site id):

```
NEXT_PUBLIC_MATOMO_URL=//analytics.ogcio.gov.ie
NEXT_PUBLIC_MATOMO_SITE_ID=<YOUR_SITE_ID>
NEXT_PUBLIC_MATOMO_PROTOCOL=https
```

