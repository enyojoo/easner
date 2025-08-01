interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 10 * 60 * 1000 // 10 minutes (increased from 5)

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // Get stale data while revalidating
  getStale<T>(key: string): { data: T | null; isStale: boolean } {
    const item = this.cache.get(key)

    if (!item) {
      return { data: null, isStale: false }
    }

    const now = Date.now()
    const isStale = now - item.timestamp > item.ttl

    return { data: item.data as T, isStale }
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  // Preload data
  async preload<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  }

  // Get cache stats for debugging
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const dataCache = new DataCache()

// Cache keys
export const CACHE_KEYS = {
  CURRENCIES: "currencies",
  EXCHANGE_RATES: "exchange_rates",
  USER_RECIPIENTS: (userId: string) => `user_recipients_${userId}`,
  PAYMENT_METHODS: "payment_methods",
  USER_TRANSACTIONS: (userId: string) => `user_transactions_${userId}`,
  TRANSACTION: (transactionId: string) => `transaction_${transactionId}`,
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
} as const
