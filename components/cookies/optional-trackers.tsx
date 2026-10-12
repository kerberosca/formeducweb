"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  COOKIE_CONSENT_EVENT,
  getTrackerConfig,
  readCookieConsent,
  type CookieConsentState
} from "@/lib/cookie-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function OptionalTrackers() {
  const trackerConfig = useMemo(() => getTrackerConfig(), []);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackers = Boolean(trackerConfig.gaMeasurementId);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const hasRouteTrackedInitialView = useRef(false);

  useEffect(() => {
    if (!hasTrackers) return;

    const syncConsent = () => {
      setConsent(readCookieConsent());
    };

    syncConsent();
    window.addEventListener("storage", syncConsent);
    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent as EventListener);

    return () => {
      window.removeEventListener("storage", syncConsent);
      window.removeEventListener(
        COOKIE_CONSENT_EVENT,
        syncConsent as EventListener
      );
    };
  }, [hasTrackers]);

  const shouldLoadGa =
    Boolean(trackerConfig.gaMeasurementId) && consent?.analytics === true;
  const queryString = searchParams.toString();
  const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

  useEffect(() => {
    if (!consent) return;

    if (!shouldLoadGa) {
      hasRouteTrackedInitialView.current = false;
      return;
    }

    if (!hasRouteTrackedInitialView.current) {
      hasRouteTrackedInitialView.current = true;
      return;
    }

    if (typeof window.gtag === "function") {
      if (trackerConfig.gaMeasurementId) {
        window.gtag("config", trackerConfig.gaMeasurementId, {
          page_path: pagePath
        });
      }
    }
  }, [consent, pagePath, shouldLoadGa, trackerConfig.gaMeasurementId]);

  if (!hasTrackers || !consent) {
    return null;
  }

  return (
    <>
      {shouldLoadGa ? (
        <>
          <Script
            id="ga-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${trackerConfig.gaMeasurementId}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
${shouldLoadGa && trackerConfig.gaMeasurementId ? `gtag("config", "${trackerConfig.gaMeasurementId}", { anonymize_ip: true });` : ""}`}
          </Script>
        </>
      ) : null}
    </>
  );
}
