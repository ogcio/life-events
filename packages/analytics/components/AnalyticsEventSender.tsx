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
    if(window["_paq"]) {
      window["_paq"].push(["setCustomUrl", window.location.origin + pathname]);
      window["_paq"].push(["trackPageView"]);
    }
  }, [pathname]);

  return null;
}
