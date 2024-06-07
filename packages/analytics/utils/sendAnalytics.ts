import { push } from "./init";
import { Dimensions } from "../types/dimensions";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL ?? "";
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID ?? "";
const MATOMO_PROTOCOL = process.env.NEXT_PUBLIC_MATOMO_PROTOCOL ?? "https";

interface AnalyticsEventRequest {
  userId?: string | number;
  category: string;
  action: string;
  name?: string;
  value?: number;
  customDimensions?: Dimensions;
}

export function sendAnalytics(request: AnalyticsEventRequest): void {
  const { category, action, name, value, customDimensions } = request;

  if (typeof window !== "undefined") {
    // client-side-only code
    push(["trackEvent", category, action, name, value, customDimensions]);
  } else {
    console.warn(
      "Tried to track on server side. The event may be not linked to a user session",
      category,
      action,
      name,
      value,
      customDimensions,
    );

    if (!MATOMO_URL || !MATOMO_SITE_ID) {
      return;
    }
    const url = buildUrl(request);
    fetch(url);
  }
}

function buildUrl(request: AnalyticsEventRequest): string {
  const { userId, category, action, name, value, customDimensions } = request;

  const rand = Math.floor(Math.random() * 1000000);

  // if MATOMO_URL does not start with http, we assume it is in the format `//domain.tld`
  // we need to add the protocol to make the URL valid
  const protocol = MATOMO_URL.startsWith("http") ? "" : `${MATOMO_PROTOCOL}:`;

  let url = `${protocol}${MATOMO_URL}/matomo.php?action_name=trackEvent&idsite=${MATOMO_SITE_ID}&rand=${rand}&rec=1&apiv=1&cookie=0&e_c=${category}&e_a=${action}`;
  if (name) {
    url += `&e_n=${name}`;
  }
  if (value) {
    url += `&e_v=${value}`;
  }
  if (userId) {
    url += `&uid=${userId}`;
  }
  if (customDimensions) {
    for (const [key, value] of Object.entries(customDimensions)) {
      url += `&dimension${key}=${value}`;
    }
  }

  return url;
}
