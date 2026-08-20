import { createHash } from "node:crypto";

import { UNKNOWN_CLIENT_IP } from "@/lib/client-ip";
import { db } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 30 * 60 * 1000;

export const AUTH_RATE_LIMITS = {
  email: { maximumAttempts: 5, windowMs: WINDOW_MS, blockMs: BLOCK_MS },
  ip: { maximumAttempts: 20, windowMs: WINDOW_MS, blockMs: BLOCK_MS },
  global: { maximumAttempts: 100, windowMs: WINDOW_MS, blockMs: BLOCK_MS }
} as const;

type RateLimitScope = keyof typeof AUTH_RATE_LIMITS;

const AUTH_RATE_LIMIT_STALE_AFTER_MS = Math.max(
  ...Object.values(AUTH_RATE_LIMITS).map((rule) => rule.windowMs)
);

function getHashSecret() {
  return (
    process.env.AUTH_RATE_LIMIT_SECRET ||
    process.env.AUTH_SECRET ||
    "formeducweb-local-auth-rate-limit"
  );
}

export function hashAuthRateLimitKey(scope: RateLimitScope, value: string) {
  return createHash("sha256")
    .update(`${scope}:${getHashSecret()}:${value}`)
    .digest("hex");
}

export async function consumeAuthRateLimitKey({
  scope,
  value,
  now = new Date()
}: {
  scope: RateLimitScope;
  value: string;
  now?: Date;
}) {
  const rule = AUTH_RATE_LIMITS[scope];
  const keyHash = hashAuthRateLimitKey(scope, value);

  return db.$transaction(async (transaction) => {
    const current = await transaction.authRateLimit.findUnique({
      where: { scope_keyHash: { scope, keyHash } }
    });

    if (current?.blockedUntil && current.blockedUntil > now) {
      await transaction.authRateLimit.update({
        where: { id: current.id },
        data: { lastAttemptAt: now }
      });
      return false;
    }

    const windowExpired =
      !current ||
      now.getTime() - current.windowStarted.getTime() >= rule.windowMs;

    if (windowExpired) {
      await transaction.authRateLimit.upsert({
        where: { scope_keyHash: { scope, keyHash } },
        create: {
          scope,
          keyHash,
          attempts: 1,
          windowStarted: now,
          lastAttemptAt: now,
          blockedUntil: null
        },
        update: {
          attempts: 1,
          windowStarted: now,
          lastAttemptAt: now,
          blockedUntil: null
        }
      });
      return true;
    }

    const attempts = current.attempts + 1;
    const allowed = attempts <= rule.maximumAttempts;

    await transaction.authRateLimit.update({
      where: { id: current.id },
      data: {
        attempts,
        lastAttemptAt: now,
        blockedUntil: allowed ? null : new Date(now.getTime() + rule.blockMs)
      }
    });

    return allowed;
  });
}

export async function consumeMagicLinkRateLimit({
  email,
  ip,
  now = new Date()
}: {
  email: string;
  ip: string;
  now?: Date;
}) {
  await db.verificationToken.deleteMany({
    where: { expires: { lt: now } }
  });
  await purgeExpiredAuthRateLimits(now);

  const emailAllowed = await consumeAuthRateLimitKey({
    scope: "email",
    value: email,
    now
  });
  // A higher global ceiling bounds identifier/header rotation without
  // treating every unknown client as one low-volume per-IP identity.
  const globalAllowed = await consumeAuthRateLimitKey({
    scope: "global",
    value: "magic-link",
    now
  });
  const ipAllowed =
    ip === UNKNOWN_CLIENT_IP
      ? true
      : await consumeAuthRateLimitKey({ scope: "ip", value: ip, now });

  return emailAllowed && ipAllowed && globalAllowed;
}

export async function purgeExpiredAuthRateLimits(now = new Date()) {
  const staleBefore = new Date(now.getTime() - AUTH_RATE_LIMIT_STALE_AFTER_MS);

  return db.authRateLimit.deleteMany({
    where: {
      lastAttemptAt: { lt: staleBefore },
      OR: [{ blockedUntil: null }, { blockedUntil: { lte: now } }]
    }
  });
}
