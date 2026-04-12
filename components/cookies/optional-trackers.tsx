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
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function OptionalTrackers() {
  const trackerConfig = useMemo(() => getTrackerConfig(), []);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackers = Boolean(trackerConfig.gaMeasurementId || trackerConfig.metaPixelId || trackerConfig.googleAdsId);
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
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent as EventListener);
    };
  }, [hasTrackers]);

  const shouldLoadGa = Boolean(trackerConfig.gaMeasurementId) && consent?.analytics === true;
  const shouldLoadGoogleAds = Boolean(trackerConfig.googleAdsId) && consent?.marketing === true;
  const shouldLoadGtag = shouldLoadGa || shouldLoadGoogleAds;
  const shouldLoadMeta = Boolean(trackerConfig.metaPixelId) && consent?.marketing === true;
  const queryString = searchParams.toString();
  const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

  useEffect(() => {
    if (!consent) return;
    if (!trackerConfig.metaPixelId) return;
    if (typeof window.fbq !== "function") return;

    window.fbq("consent", shouldLoadMeta ? "grant" : "revoke");
  }, [consent, shouldLoadMeta, trackerConfig.metaPixelId]);

  useEffect(() => {
    if (!consent) return;

    if (!shouldLoadGtag && !shouldLoadMeta) {
      hasRouteTrackedInitialView.current = false;
      return;
    }

    if (!hasRouteTrackedInitialView.current) {
      hasRouteTrackedInitialView.current = true;
      return;
    }

    if (typeof window.gtag === "function") {
      if (shouldLoadGa && trackerConfig.gaMeasurementId) {
        window.gtag("config", trackerConfig.gaMeasurementId, { page_path: pagePath });
      }

      if (shouldLoadGoogleAds && trackerConfig.googleAdsId) {
        window.gtag("config", trackerConfig.googleAdsId, { page_path: pagePath });
      }
    }

    if (shouldLoadMeta && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [
    consent,
    pagePath,
    shouldLoadGa,
    shouldLoadGoogleAds,
    shouldLoadGtag,
    shouldLoadMeta,
    trackerConfig.gaMeasurementId,
    trackerConfig.googleAdsId
  ]);

  if (!hasTrackers || !consent) {
    return null;
  }

  return (
    <>
      {shouldLoadGtag ? (
        <>
          <Script
            id="ga-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${trackerConfig.gaMeasurementId || trackerConfig.googleAdsId}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
${shouldLoadGa && trackerConfig.gaMeasurementId ? `gtag("config", "${trackerConfig.gaMeasurementId}", { anonymize_ip: true });` : ""}
${shouldLoadGoogleAds && trackerConfig.googleAdsId ? `gtag("config", "${trackerConfig.googleAdsId}");` : ""}`}
          </Script>
        </>
      ) : null}

      {shouldLoadMeta ? (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(
window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
fbq("init", "${trackerConfig.metaPixelId}");
fbq("consent", "grant");
fbq("track", "PageView");`}
        </Script>
      ) : null}
    </>
  );
}
