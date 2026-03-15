"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

import {
  COOKIE_CONSENT_EVENT,
  getTrackerConfig,
  readCookieConsent,
  type CookieConsentState
} from "@/lib/cookie-consent";

export function OptionalTrackers() {
  const trackerConfig = useMemo(() => getTrackerConfig(), []);
  const hasTrackers = Boolean(trackerConfig.gaMeasurementId || trackerConfig.metaPixelId);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);

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

  if (!hasTrackers || !consent) {
    return null;
  }

  const shouldLoadGa = Boolean(trackerConfig.gaMeasurementId) && consent.analytics;
  const shouldLoadMeta = Boolean(trackerConfig.metaPixelId) && consent.marketing;

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
gtag("config", "${trackerConfig.gaMeasurementId}", { anonymize_ip: true });`}
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
