import { beforeEach, describe, expect, it, vi } from "vitest";

import { trackAnalyticsEvent, trackAnalyticsEventOnce } from "@/lib/analytics";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent";

function grantAnalyticsConsent() {
  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({
      analytics: true,
      marketing: false,
      updatedAt: new Date().toISOString(),
      version: 1
    })
  );
}

describe("analytics", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.gtag = vi.fn();
  });

  it("ne transmet rien sans consentement analytics", () => {
    trackAnalyticsEvent("generate_lead", { lead_type: "contact" });
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("transmet les événements essentiels du tunnel avec leur contexte", () => {
    grantAnalyticsConsent();

    trackAnalyticsEventOnce("diagnostic_start", "ai", {
      diagnostic: "ai"
    });
    trackAnalyticsEventOnce("generate_lead", "assessment-123", {
      lead_type: "diagnostic",
      diagnostic: "ai"
    });

    expect(window.gtag).toHaveBeenNthCalledWith(
      1,
      "event",
      "diagnostic_start",
      {
        diagnostic: "ai"
      }
    );
    expect(window.gtag).toHaveBeenNthCalledWith(2, "event", "generate_lead", {
      lead_type: "diagnostic",
      diagnostic: "ai"
    });
  });

  it.each([
    ["loi25_kit", 29],
    ["trio_upgrade", 30],
    ["digital_hygiene_trio", 59]
  ] as const)(
    "transmet checkout_started pour %s à %i $ CAD",
    (product, value) => {
      grantAnalyticsConsent();
      const transactionId = `order-${value}`;

      trackAnalyticsEventOnce("checkout_started", transactionId, {
        transaction_id: transactionId,
        value,
        currency: "CAD",
        product,
        diagnostic: "ai"
      });

      expect(window.gtag).toHaveBeenCalledWith("event", "checkout_started", {
        transaction_id: transactionId,
        value,
        currency: "CAD",
        product,
        diagnostic: "ai"
      });
    }
  );

  it("transmet les paramètres commerciaux complets une seule fois", () => {
    grantAnalyticsConsent();

    const parameters = {
      transaction_id: "order-123",
      value: 59,
      currency: "CAD",
      product: "digital_hygiene_trio",
      diagnostic: "ai",
      utm_source: "linkedin",
      omitted: undefined
    };
    trackAnalyticsEventOnce("purchase", "order-123", parameters);
    window.sessionStorage.clear();
    trackAnalyticsEventOnce("purchase", "order-123", parameters);

    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(
      window.localStorage.getItem("formeducweb-analytics-purchase-order-123")
    ).toBe("1");
    expect(window.gtag).toHaveBeenCalledWith("event", "purchase", {
      transaction_id: "order-123",
      value: 59,
      currency: "CAD",
      product: "digital_hygiene_trio",
      diagnostic: "ai",
      utm_source: "linkedin"
    });
  });
});
