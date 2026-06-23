"use client";

import { useEffect } from "react";

import { trackMetaPurchase } from "@/lib/meta-pixel";

type MetaPurchaseTrackerProps = {
  sessionId: string;
  valueCents?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
};

export function MetaPurchaseTracker({
  sessionId,
  valueCents,
  currency = "CAD",
  contentName = "Rapport complet",
  contentCategory = "Diagnostic"
}: MetaPurchaseTrackerProps) {
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
      content_name: contentName,
      content_category: contentCategory
    });

    if (!sent) return;

    try {
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Ignore storage write errors and keep the tracking call best-effort.
    }
  }, [contentCategory, contentName, currency, sessionId, valueCents]);

  return null;
}
