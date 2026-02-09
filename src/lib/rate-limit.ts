type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMITS = new Map<string, RateLimitEntry>();

export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const existing = RATE_LIMITS.get(params.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + params.windowMs;
    RATE_LIMITS.set(params.key, { count: 1, resetAt });
    return { allowed: true, remaining: params.limit - 1, resetAt };
  }

  if (existing.count >= params.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: params.limit - existing.count,
    resetAt: existing.resetAt,
  };
}
