"use client";

import { init, push } from "../utils/init";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL ?? "";
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID ?? "";

interface AnalyticsTrackerProps {
  /**
   * The user ID to track.
   * Ensure that the user ID is unique to the user.
   * Tracking the UserID should be done in compliance with the GDPR.
   * @default undefined
   */
  userId?: string | number;
  customDimensions?: Dimensions;
}

export default function AnalyticsTracker({
  userId,
  customDimensions,
}: AnalyticsTrackerProps) {
  // avoid tracking if no MATOMO_URL or MATOMO_SITE_ID
  if (!MATOMO_URL || !MATOMO_SITE_ID) {
    return null;
  }

  const initFunction = () => {
    if (userId) {
      push(["setUserId", userId]);
    }

    if (customDimensions) {
      for (const [key, value] of Object.entries(customDimensions)) {
        push(["setCustomDimension", key.replace("dimension", ""), value]);
      }
    }
  };

  const pathname = usePathname();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    init({
      url: MATOMO_URL,
      siteId: MATOMO_SITE_ID,
      disableCookies: true,
      onInitialization: initFunction,
    });
    return () => push(["HeatmapSessionRecording::disable"]);
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    } else if (pathname) {
      push(["setCustomUrl", pathname]);
      push(["trackPageView"]);
    }
  }, [pathname]);

  return null;
}
