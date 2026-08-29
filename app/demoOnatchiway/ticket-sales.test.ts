import { describe, expect, it } from "vitest";

import { normalizeOfficialSoldTickets } from "@/app/demoOnatchiway/ticket-sales";

describe("compteur officiel Onatchiway", () => {
  it("lit le nombre de billets utilisé par la billetterie officielle", () => {
    expect(
      normalizeOfficialSoldTickets({
        numberBearerTicketsSold: 43,
        numberDrawNumbersSold: 85,
        transactions: [{ customer_name: "Ne doit pas être relayé" }]
      })
    ).toBe(85);
  });

  it("borne le compteur et refuse les formats invalides", () => {
    expect(
      normalizeOfficialSoldTickets({ numberDrawNumbersSold: 20_000 })
    ).toBe(10_000);
    expect(normalizeOfficialSoldTickets({ numberDrawNumbersSold: -4 })).toBe(0);
    expect(normalizeOfficialSoldTickets({ numberDrawNumbersSold: "85" })).toBe(
      null
    );
    expect(normalizeOfficialSoldTickets(null)).toBe(null);
  });
});
