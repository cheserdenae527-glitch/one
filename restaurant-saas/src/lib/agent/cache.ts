import type { DailyAgentSuggestion } from "./types";

// In-memory Map for development; replace with Redis in production
const cacheStore = new Map<string, DailyAgentSuggestion>();
const lockStore = new Map<string, boolean>();

function cacheKey(merchantId: string, date: string): string {
  return `agent:suggestion:${merchantId}:${date}`;
}

function lockKey(merchantId: string, date: string): string {
  return `agent:lock:${merchantId}:${date}`;
}

async function pollForCache(
  key: string,
  options: { intervalMs: number; timeoutMs: number }
): Promise<DailyAgentSuggestion | null> {
  const start = Date.now();
  while (Date.now() - start < options.timeoutMs) {
    const cached = cacheStore.get(key);
    if (cached) return cached;
    await new Promise(r => setTimeout(r, options.intervalMs));
  }
  return null;
}

export async function getDailySuggestion(
  merchantId: string,
  date: string
): Promise<DailyAgentSuggestion | null> {
  const cKey = cacheKey(merchantId, date);
  const lKey = lockKey(merchantId, date);

  // 1. Check cache
  const cached = cacheStore.get(cKey);
  if (cached) return cached;

  // 2. Try to acquire lock (NX simulation)
  if (lockStore.get(lKey)) {
    return await pollForCache(cKey, { intervalMs: 100, timeoutMs: 5000 });
  }

  lockStore.set(lKey, true);

  try {
    // Execute full pipeline (to be wired up in Phase 2)
    return null;
  } finally {
    lockStore.delete(lKey);
  }
}

export function clearDailyCache(merchantId: string, date: string): void {
  cacheStore.delete(cacheKey(merchantId, date));
}

export function setDailySuggestion(
  merchantId: string,
  date: string,
  suggestion: DailyAgentSuggestion
): void {
  cacheStore.set(cacheKey(merchantId, date), suggestion);
}
