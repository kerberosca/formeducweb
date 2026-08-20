import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  checkRateLimit,
  getRateLimitStoreSizeForTests,
  RATE_LIMIT_STORE_MAX_ENTRIES,
  resetRateLimitStoreForTests
} from "@/lib/rate-limit";

const originalTrustedProxyHeaders = process.env.TRUSTED_PROXY_HEADERS;

function request(ip: string) {
  return new Request("https://formeducweb.local/api/test", {
    headers: {
      "x-forwarded-for": ip,
      "x-real-ip": ip,
      "cf-connecting-ip": ip
    }
  });
}

describe("generic rate limit identity", () => {
  beforeEach(() => {
    delete process.env.TRUSTED_PROXY_HEADERS;
    resetRateLimitStoreForTests();
  });

  afterEach(() => {
    if (originalTrustedProxyHeaders === undefined) {
      delete process.env.TRUSTED_PROXY_HEADERS;
    } else {
      process.env.TRUSTED_PROXY_HEADERS = originalTrustedProxyHeaders;
    }
  });

  it("ignore les adresses falsifiées sans appliquer le petit quota par IP à tout le monde", () => {
    const bucket = `spoof-default-${crypto.randomUUID()}`;
    const options = {
      bucket,
      limit: 1,
      windowMs: 60_000
    };

    for (let attempt = 0; attempt < 100; attempt += 1) {
      expect(
        checkRateLimit(request(`203.0.113.${(attempt % 250) + 1}`), options)
          .allowed
      ).toBe(true);
    }

    expect(
      checkRateLimit(request("198.51.100.200"), {
        bucket,
        limit: 1,
        windowMs: 60_000
      }).allowed
    ).toBe(false);
  });

  it("distingue seulement les IP valides fournies par un proxy explicitement fiable", () => {
    process.env.TRUSTED_PROXY_HEADERS = "1";
    const bucket = `trusted-${crypto.randomUUID()}`;
    const options = { bucket, limit: 1, windowMs: 60_000 };

    expect(checkRateLimit(request("203.0.113.10"), options).allowed).toBe(true);
    expect(checkRateLimit(request("203.0.113.11"), options).allowed).toBe(true);
    expect(checkRateLimit(request("203.0.113.10"), options).allowed).toBe(
      false
    );
  });

  it("borne et évince le stockage en mémoire", () => {
    const requestWithoutProxy = new Request(
      "https://formeducweb.local/api/test"
    );

    for (let index = 0; index < RATE_LIMIT_STORE_MAX_ENTRIES + 25; index += 1) {
      checkRateLimit(requestWithoutProxy, {
        bucket: `capacity-${index}`,
        limit: 1,
        windowMs: 60_000
      });
    }

    expect(getRateLimitStoreSizeForTests()).toBe(RATE_LIMIT_STORE_MAX_ENTRIES);
  });
});
