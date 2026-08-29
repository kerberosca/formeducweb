import { describe, expect, it } from "vitest";

import {
  contestConfig,
  getContestState,
  getCountdown,
  getTicketAction,
  officialRules,
  prizeTiers
} from "@/app/demoOnatchiway/contest";

describe("concours Onatchiway", () => {
  it.each([
    [999, 1],
    [1_000, 2],
    [2_499, 4],
    [2_500, 5],
    [3_999, 6],
    [4_000, 7]
  ])("place %i billets au palier %i", (soldTickets, level) => {
    expect(getContestState(soldTickets).currentTier.level).toBe(level);
  });

  it("borne le compteur et conserve le lot maximal corrigé", () => {
    expect(getContestState(-1).soldTickets).toBe(0);
    expect(getContestState(20_000).soldTickets).toBe(contestConfig.maxTickets);
    expect(prizeTiers.at(-1)?.cumulativeValue).toBe(8_085.55);
    expect(prizeTiers[4]?.cumulativeValue).toBe(4_038.51);
    expect(
      prizeTiers.reduce((total, tier) => total + tier.addedValue, 0)
    ).toBeCloseTo(8_085.55, 2);
  });

  it("publie le règlement révisé et la billetterie officielle", () => {
    expect(officialRules).toHaveLength(31);
    expect(contestConfig.ticketingUrl).toBe(
      "https://tirage.moitiemoitie.com/901"
    );
    expect(contestConfig.neq).toBe("114 207 3668");
  });

  it("ferme la billetterie à l'échéance", () => {
    const before = new Date("2026-10-18T23:54:59-04:00");
    const closed = new Date("2026-10-18T23:55:00-04:00");

    expect(getCountdown(contestConfig.salesClose, before).closed).toBe(false);
    expect(getCountdown(contestConfig.salesClose, closed).closed).toBe(true);
    expect(
      getTicketAction("https://example.com", contestConfig.salesClose, closed)
    ).toBe("closed");
  });
});
