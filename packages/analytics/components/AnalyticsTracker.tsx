import { OGCIO } from "analytics-sdk";
import Script from 'next/script'

const ANALYTICS_WEBSITE_ID = process.env.ANALYTICS_WEBSITE_ID;
const authConfig = {
  applicationId: process.env.AUTH_APP_ID,
  applicationSecret: process.env.AUTH_APP_SECRET,
  logtoOidcEndpoint: process.env.AUTH_OIDC_ENDPOINT,
  organizationId: process.env.AUTH_ORGANIZATION_ID,
  scopes: process.env.AUTH_SCOPES ? process.env.AUTH_SCOPES.split(",") : undefined
}

interface AnalyticsTrackerProps {
  /**
   * The user ID to track.
   * Ensure that the user ID is unique to the user.
   * Tracking the UserID should be done in compliance with the GDPR.
   * @default undefined
   */
  userId?: string | number;
}

export default async function AnalyticsTracker({
  userId,
}: AnalyticsTrackerProps) {
  // avoid tracking if no MATOMO_URL or MATOMO_SITE_ID
  if (!ANALYTICS_WEBSITE_ID) {
    return null;
  }

  const ogcioAnalyticsSDK = new OGCIO();
  await ogcioAnalyticsSDK.auth(authConfig);
  const trackingScript = await ogcioAnalyticsSDK.analytics.getTrackingCode(process.env.ANALYTICS_WEBSITE_ID, {});
  return (<>
    <Script>{trackingScript.data?.data.script}</Script>
  </>);
}
