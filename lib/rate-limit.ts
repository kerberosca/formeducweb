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

const globalRateLimit = globalThis as typeof globalThis & {
  __formeducwebRateLimitStore?: RateLimitStore;
};

function getStore() {
  if (!globalRateLimit.__formeducwebRateLimitStore) {
    globalRateLimit.__formeducwebRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalRateLimit.__formeducwebRateLimitStore;
}

function cleanupStore(store: RateLimitStore, now: number) {
  if (store.size < 2000) return;

  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const store = getStore();
  const key = `${options.bucket}:${getClientIp(request)}`;
  const current = store.get(key);

  cleanupStore(store, now);

  if (!current || current.resetAt <= now) {
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
  store.set(key, current);

  if (current.count > options.limit) {
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
