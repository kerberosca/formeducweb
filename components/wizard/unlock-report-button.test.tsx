import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UnlockReportButton } from "@/components/wizard/unlock-report-button";

const mocks = vi.hoisted(() => ({
  trackAnalyticsEventOnce: vi.fn()
}));

vi.mock("@/lib/analytics", () => ({
  trackAnalyticsEventOnce: mocks.trackAnalyticsEventOnce
}));

vi.mock("@/lib/attribution", () => ({
  getFirstTouchAttribution: () => ({ utm_source: "test" })
}));

describe("UnlockReportButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["loi25_kit", 29],
    ["trio_upgrade", 30],
    ["digital_hygiene_trio", 59]
  ] as const)(
    "attribue orderToken à checkout_started pour %s",
    async (productCode, value) => {
      const orderToken = `order-token-${value}`;
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({
            url: "#checkout",
            orderToken
          })
        })
      );
      const user = userEvent.setup();

      render(
        <UnlockReportButton
          assessmentType="ai"
          assessmentId={`assessment-${value}`}
          productCode={productCode}
          value={value}
          label={`Acheter ${value}`}
        />
      );

      await user.click(
        screen.getByRole("button", { name: `Acheter ${value}` })
      );

      await waitFor(() =>
        expect(mocks.trackAnalyticsEventOnce).toHaveBeenCalledWith(
          "checkout_started",
          orderToken,
          {
            transaction_id: orderToken,
            value,
            currency: "CAD",
            product: productCode,
            diagnostic: "ai",
            utm_source: "test"
          }
        )
      );
    }
  );
});
