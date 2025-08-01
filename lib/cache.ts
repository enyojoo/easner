interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 2 * 60 * 1000 // 2 minutes
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval
    this.startCleanup()
  }

  private startCleanup() {
    // Clean up expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired()
    }, 60 * 1000)
  }

  private cleanupExpired() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

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

  // Preload data to cache with timeout
  preload<T>(key: string, dataPromise: Promise<T>, ttl?: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Cache preload timeout")), 10000) // 10 second timeout
    })

    return Promise.race([dataPromise, timeoutPromise])
      .then((data) => {
        this.set(key, data, ttl)
        return data
      })
      .catch((error) => {
        console.error(`Failed to preload cache for ${key}:`, error)
        throw error
      })
  }

  // Get cache stats for debugging
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  // Cleanup method
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
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
