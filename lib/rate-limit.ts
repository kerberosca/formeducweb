import { resolveClientIp, UNKNOWN_CLIENT_IP } from "@/lib/client-ip";

type RateLimitOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

export const RATE_LIMIT_STORE_MAX_ENTRIES = 2000;
export const UNKNOWN_CLIENT_GLOBAL_LIMIT_MINIMUM = 100;
export const UNKNOWN_CLIENT_GLOBAL_LIMIT_MULTIPLIER = 10;
export const UNKNOWN_CLIENT_GLOBAL_LIMIT_MAXIMUM = 1000;

const globalRateLimit = globalThis as typeof globalThis & {
  __formeducwebRateLimitStore?: RateLimitStore;
};

function getStore() {
  if (!globalRateLimit.__formeducwebRateLimitStore) {
    globalRateLimit.__formeducwebRateLimitStore = new Map<
      string,
      RateLimitEntry
    >();
  }

  return globalRateLimit.__formeducwebRateLimitStore;
}

function deleteExpiredEntries(store: RateLimitStore, now: number) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

function reserveEntry(store: RateLimitStore, now: number) {
  if (store.size < RATE_LIMIT_STORE_MAX_ENTRIES) return;

  deleteExpiredEntries(store, now);
  while (store.size >= RATE_LIMIT_STORE_MAX_ENTRIES) {
    const oldestKey = store.keys().next().value as string | undefined;
    if (!oldestKey) break;
    store.delete(oldestKey);
  }
}

function touchEntry(store: RateLimitStore, key: string, entry: RateLimitEntry) {
  store.delete(key);
  store.set(key, entry);
}

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const store = getStore();
  const clientIp = resolveClientIp(request);
  const isUnknownClient = clientIp === UNKNOWN_CLIENT_IP;
  const effectiveLimit = isUnknownClient
    ? Math.min(
        UNKNOWN_CLIENT_GLOBAL_LIMIT_MAXIMUM,
        Math.max(
          UNKNOWN_CLIENT_GLOBAL_LIMIT_MINIMUM,
          options.limit * UNKNOWN_CLIENT_GLOBAL_LIMIT_MULTIPLIER
        )
      )
    : options.limit;
  // Spoofable headers must neither rotate the identity nor turn the smaller
  // per-IP threshold into a site-wide lockout when no transport IP is known.
  const key = isUnknownClient
    ? `${options.bucket}:global`
    : `${options.bucket}:ip:${clientIp}`;
  let current = store.get(key);

  if (current?.resetAt && current.resetAt <= now) {
    store.delete(key);
    current = undefined;
  }

  if (!current) {
    reserveEntry(store, now);
    const next: RateLimitEntry = {
      count: 1,
      resetAt: now + options.windowMs
    };
    store.set(key, next);
    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000)
    };
  }

  current.count += 1;
  touchEntry(store, key, current);

  if (current.count > effectiveLimit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  };
}

export function getRateLimitStoreSizeForTests() {
  return getStore().size;
}

export function resetRateLimitStoreForTests() {
  getStore().clear();
}
