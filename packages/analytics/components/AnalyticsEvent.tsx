"use client";

import { useEffect } from "react";
import { sendAnalytics } from "../utils/sendAnalytics";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL ?? "";
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID ?? "";

interface AnalyticsEventProps {
  userId?: string | number;
  category: string;
  action: string;
  name?: string;
  value?: number;
  customDimensions?: Dimensions;
}

export default function AnalyticsEvent({
  userId,
  category,
  action,
  name,
  value,
  customDimensions,
}: AnalyticsEventProps) {
  // avoid tracking if no MATOMO_URL or MATOMO_SITE_ID
  if (!MATOMO_URL || !MATOMO_SITE_ID) {
    return null;
  }
  useEffect(() => {
    sendAnalytics({ userId, category, action, name, value, customDimensions });
  }, [userId, category, action, name, value, customDimensions]);

  return null;
}
