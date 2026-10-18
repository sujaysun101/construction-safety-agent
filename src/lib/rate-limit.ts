type Bucket = { tokens: number; updated: number };

const buckets = new Map<string, Bucket>();
const CAPACITY = 8;
const WINDOW_MS = 60 * 60 * 1000;

async function upstashLimit(userId: string): Promise<{ ok: boolean; remaining: number } | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(CAPACITY, "1 h"),
    prefix: "hivis:analyze",
  });
  const result = await ratelimit.limit(userId);
  return { ok: result.success, remaining: result.remaining };
}

export async function consumeAnalysis(userId: string): Promise<{ ok: boolean; remaining: number }> {
  const remote = await upstashLimit(userId);
  if (remote) return remote;

  const now = Date.now();
  const bucket = buckets.get(userId) ?? { tokens: CAPACITY, updated: now };
  const refill = ((now - bucket.updated) / WINDOW_MS) * CAPACITY;
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + refill);
  bucket.updated = now;
  if (bucket.tokens < 1) {
    buckets.set(userId, bucket);
    return { ok: false, remaining: 0 };
  }
  bucket.tokens -= 1;
  buckets.set(userId, bucket);
  return { ok: true, remaining: Math.floor(bucket.tokens) };
}

export function resetAnalysisBuckets(): void {
  buckets.clear();
}
