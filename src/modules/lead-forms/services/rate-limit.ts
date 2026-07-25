/** Simple in-process sliding-window rate limiter for public form submits. */
const buckets = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

export function assertPublicSubmitRateLimit(key: string): void {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const recent = (buckets.get(key) ?? []).filter((ts) => ts > cutoff);
  if (recent.length >= MAX_REQUESTS) {
    const error = new Error("Too many submissions. Please try again shortly.");
    (error as Error & { status?: number }).status = 429;
    throw error;
  }
  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic cleanup
  if (buckets.size > 5000) {
    for (const [k, stamps] of buckets) {
      const kept = stamps.filter((ts) => ts > cutoff);
      if (kept.length === 0) buckets.delete(k);
      else buckets.set(k, kept);
    }
  }
}
