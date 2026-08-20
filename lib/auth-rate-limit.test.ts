import { beforeEach, describe, expect, it } from "vitest";

import {
  AUTH_RATE_LIMITS,
  consumeAuthRateLimitKey,
  consumeMagicLinkRateLimit,
  hashAuthRateLimitKey,
  purgeExpiredAuthRateLimits
} from "@/lib/auth-rate-limit";
import { UNKNOWN_CLIENT_IP } from "@/lib/client-ip";
import { db } from "@/lib/db";

describe("persistent authentication rate limits", () => {
  beforeEach(async () => {
    await db.authRateLimit.deleteMany();
  });

  it("bloque une adresse après le nombre de demandes permis", async () => {
    const now = new Date("2026-08-08T12:00:00.000Z");
    const email = "learner@example.ca";

    for (
      let attempt = 0;
      attempt < AUTH_RATE_LIMITS.email.maximumAttempts;
      attempt += 1
    ) {
      await expect(
        consumeAuthRateLimitKey({ scope: "email", value: email, now })
      ).resolves.toBe(true);
    }

    await expect(
      consumeAuthRateLimitKey({ scope: "email", value: email, now })
    ).resolves.toBe(false);

    const stored = await db.authRateLimit.findUnique({
      where: {
        scope_keyHash: {
          scope: "email",
          keyHash: hashAuthRateLimitKey("email", email)
        }
      }
    });

    expect(stored?.blockedUntil).toBeInstanceOf(Date);
    expect(stored?.keyHash).not.toContain(email);
  });

  it("réinitialise la fenêtre après la fin du blocage", async () => {
    const firstAttempt = new Date("2026-08-08T12:00:00.000Z");
    const email = "reset@example.ca";

    for (
      let attempt = 0;
      attempt <= AUTH_RATE_LIMITS.email.maximumAttempts;
      attempt += 1
    ) {
      await consumeAuthRateLimitKey({
        scope: "email",
        value: email,
        now: firstAttempt
      });
    }

    await expect(
      consumeAuthRateLimitKey({
        scope: "email",
        value: email,
        now: new Date(
          firstAttempt.getTime() + AUTH_RATE_LIMITS.email.blockMs + 1
        )
      })
    ).resolves.toBe(true);
  });

  it("purge seulement les clés expirées et conserve les blocages actifs", async () => {
    const now = new Date("2026-08-08T12:00:00.000Z");
    const stale = new Date(now.getTime() - AUTH_RATE_LIMITS.email.windowMs - 1);
    const recent = new Date(now.getTime() - 60_000);
    const keys = {
      stale: hashAuthRateLimitKey("email", "stale@example.ca"),
      expiredBlock: hashAuthRateLimitKey("email", "expired@example.ca"),
      activeBlock: hashAuthRateLimitKey("email", "active@example.ca"),
      recent: hashAuthRateLimitKey("email", "recent@example.ca")
    };

    await db.authRateLimit.createMany({
      data: [
        {
          scope: "email",
          keyHash: keys.stale,
          attempts: 1,
          windowStarted: stale,
          lastAttemptAt: stale
        },
        {
          scope: "email",
          keyHash: keys.expiredBlock,
          attempts: 6,
          windowStarted: stale,
          lastAttemptAt: stale,
          blockedUntil: new Date(now.getTime() - 1)
        },
        {
          scope: "email",
          keyHash: keys.activeBlock,
          attempts: 6,
          windowStarted: stale,
          lastAttemptAt: stale,
          blockedUntil: new Date(now.getTime() + 60_000)
        },
        {
          scope: "email",
          keyHash: keys.recent,
          attempts: 1,
          windowStarted: recent,
          lastAttemptAt: recent
        }
      ]
    });

    await purgeExpiredAuthRateLimits(now);

    const remaining = await db.authRateLimit.findMany({
      select: { keyHash: true }
    });
    expect(remaining.map((entry) => entry.keyHash).sort()).toEqual(
      [keys.activeBlock, keys.recent].sort()
    );
  });

  it("remplace le petit quota IP partagé par un quota global distinct", async () => {
    const now = new Date("2026-08-08T12:00:00.000Z");
    const ipKeyHash = hashAuthRateLimitKey("ip", UNKNOWN_CLIENT_IP);
    await db.authRateLimit.create({
      data: {
        scope: "ip",
        keyHash: ipKeyHash,
        attempts: AUTH_RATE_LIMITS.ip.maximumAttempts,
        windowStarted: now,
        lastAttemptAt: now
      }
    });

    await expect(
      consumeMagicLinkRateLimit({
        email: "first-unknown@example.ca",
        ip: UNKNOWN_CLIENT_IP,
        now
      })
    ).resolves.toBe(true);

    await expect(
      db.authRateLimit.findUnique({
        where: { scope_keyHash: { scope: "ip", keyHash: ipKeyHash } }
      })
    ).resolves.toMatchObject({ attempts: AUTH_RATE_LIMITS.ip.maximumAttempts });
    await expect(
      db.authRateLimit.findFirst({ where: { scope: "global" } })
    ).resolves.toMatchObject({ attempts: 1 });
  });

  it("borne les rotations d’identifiants par un quota global plus élevé", async () => {
    const now = new Date("2026-08-08T12:00:00.000Z");
    const globalKeyHash = hashAuthRateLimitKey("global", "magic-link");
    await db.authRateLimit.create({
      data: {
        scope: "global",
        keyHash: globalKeyHash,
        attempts: 99,
        windowStarted: now,
        lastAttemptAt: now
      }
    });

    await expect(
      consumeMagicLinkRateLimit({
        email: "global-100@example.ca",
        ip: UNKNOWN_CLIENT_IP,
        now
      })
    ).resolves.toBe(true);
    await expect(
      consumeMagicLinkRateLimit({
        email: "global-101@example.ca",
        ip: UNKNOWN_CLIENT_IP,
        now
      })
    ).resolves.toBe(false);
  });
});
