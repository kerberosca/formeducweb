"use client";

import { useEffect } from "react";

import { trackMetaPurchase } from "@/lib/meta-pixel";

type MetaPurchaseTrackerProps = {
  sessionId: string;
  valueCents?: number;
  currency?: string;
};

export function MetaPurchaseTracker({ sessionId, valueCents, currency = "CAD" }: MetaPurchaseTrackerProps) {
  useEffect(() => {
    if (!sessionId) return;

    const storageKey = `formeducweb-meta-purchase-${sessionId}`;

    try {
      if (window.sessionStorage.getItem(storageKey) === "1") {
        return;
      }
    } catch {
      // Some environments may block storage access. We can still try sending once.
    }

    const normalizedValue = typeof valueCents === "number" ? Number((valueCents / 100).toFixed(2)) : undefined;
    const sent = trackMetaPurchase({
      value: normalizedValue,
      currency: currency.toUpperCase(),
      content_name: "Rapport complet Loi 25",
      content_category: "Diagnostic Loi 25"
    });

    if (!sent) return;

    try {
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Ignore storage write errors and keep the tracking call best-effort.
    }
  }, [currency, sessionId, valueCents]);

  return null;
}
