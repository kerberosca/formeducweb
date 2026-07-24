"use client";

import { useEffect } from "react";

import { trackAnalyticsEventOnce } from "@/lib/analytics";
import { getFirstTouchAttribution } from "@/lib/attribution";
import type { AssessmentType } from "@/lib/diagnostics";

export function PurchaseTracker({
  assessmentType,
  transactionId,
  productCode,
  value,
  currency = "CAD"
}: {
  assessmentType: AssessmentType;
  transactionId?: string;
  productCode?: string;
  value?: number;
  currency?: string;
}) {
  useEffect(() => {
    if (!transactionId || !productCode || value === undefined) return;

    const attribution = getFirstTouchAttribution();
    trackAnalyticsEventOnce("purchase", transactionId, {
      transaction_id: transactionId,
      value,
      currency,
      product: productCode,
      diagnostic: assessmentType,
      ...attribution
    });
  }, [assessmentType, currency, productCode, transactionId, value]);

  return null;
}
