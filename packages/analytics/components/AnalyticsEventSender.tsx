"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AnalyticsEventSender() {

  const pathname = usePathname();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    // TODO: replace with @ogcio/analytics-sdk after npm package release
    if(window["_paq"]) {
      window["_paq"].push(["setCustomUrl", window.location.origin + pathname]);
      window["_paq"].push(["trackPageView"]);
    }
  }, [pathname]);

  return null;
}
