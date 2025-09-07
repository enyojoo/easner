type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

const counters = new Map<string, { count: number; resetAt: number }>()

export function rateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now()
  const bucket = counters.get(key)
  if (!bucket || now > bucket.resetAt) {
    counters.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count += 1
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
}

