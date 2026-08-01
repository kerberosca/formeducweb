import { describe, expect, it } from "vitest";

import {
  createDemoOnatchiwaySessionToken,
  DEMO_ONATCHIWAY_SESSION_SECONDS,
  verifyDemoOnatchiwaySessionToken
} from "@/lib/demo-onatchiway-session";

describe("session privée Onatchiway", () => {
  const secret = "test-session-secret-that-is-long-enough";
  const now = Date.UTC(2026, 7, 1, 12, 0, 0);

  it("demeure valide pendant exactement 90 jours", () => {
    const token = createDemoOnatchiwaySessionToken(secret, now);
    const expiresAt = now + DEMO_ONATCHIWAY_SESSION_SECONDS * 1_000;

    expect(verifyDemoOnatchiwaySessionToken(token, secret, expiresAt - 1)).toBe(
      true
    );
    expect(verifyDemoOnatchiwaySessionToken(token, secret, expiresAt)).toBe(
      false
    );
  });

  it("refuse un témoin altéré ou signé avec un autre secret", () => {
    const token = createDemoOnatchiwaySessionToken(secret, now);

    expect(verifyDemoOnatchiwaySessionToken(`${token}x`, secret, now)).toBe(
      false
    );
    expect(verifyDemoOnatchiwaySessionToken(token, "autre-secret", now)).toBe(
      false
    );
  });
});
