import { contestConfig } from "./contest";

type TicketingStats = {
  numberDrawNumbersSold?: unknown;
};

type TicketSalesCache = {
  expiresAt: number;
  value: number;
};

let cache: TicketSalesCache = {
  expiresAt: 0,
  value: contestConfig.soldTickets
};
let pendingRefresh: Promise<number> | null = null;

export function normalizeOfficialSoldTickets(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;

  const rawValue = (payload as TicketingStats).numberDrawNumbersSold;
  if (typeof rawValue !== "number" || !Number.isFinite(rawValue)) return null;

  return Math.min(contestConfig.maxTickets, Math.max(0, Math.floor(rawValue)));
}

async function requestOfficialSoldTickets(): Promise<number> {
  const response = await fetch(contestConfig.ticketingStatsUrl, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5_000)
  });

  if (!response.ok) {
    throw new Error(`Billetterie indisponible (${response.status})`);
  }

  const soldTickets = normalizeOfficialSoldTickets(await response.json());
  if (soldTickets === null) {
    throw new Error("Compteur de billetterie invalide");
  }

  return soldTickets;
}

export async function getLiveSoldTickets(): Promise<number> {
  const now = Date.now();
  if (cache.expiresAt > now) return cache.value;
  if (pendingRefresh) return pendingRefresh;

  pendingRefresh = (async () => {
    try {
      const value = await requestOfficialSoldTickets();
      cache = {
        expiresAt: Date.now() + contestConfig.ticketSalesRefreshMs,
        value
      };
    } catch {
      // Une panne de la billetterie ne doit jamais faire reculer le compteur.
      cache = {
        expiresAt:
          Date.now() + Math.min(60_000, contestConfig.ticketSalesRefreshMs),
        value: cache.value
      };
    } finally {
      pendingRefresh = null;
    }

    return cache.value;
  })();

  return pendingRefresh;
}
