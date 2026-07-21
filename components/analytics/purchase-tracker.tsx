"use client";

import { useEffect } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics";
import type { AssessmentType } from "@/lib/diagnostics";

export function PurchaseTracker({
  assessmentType
}: {
  assessmentType: AssessmentType;
}) {
  useEffect(() => {
    const key = `formeducweb-purchase-${assessmentType}`;
    if (window.sessionStorage.getItem(key)) return;

    trackAnalyticsEvent("purchase", { diagnostic_type: assessmentType });
    window.sessionStorage.setItem(key, "1");
  }, [assessmentType]);

  return null;
}
