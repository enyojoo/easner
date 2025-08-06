interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  isStale?: boolean
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 30 * 1000 // Reduced to 30 seconds
  private readonly STALE_WHILE_REVALIDATE_TTL = 2 * 60 * 1000 // Reduced to 2 minutes
  private refreshPromises = new Map<string, Promise<any>>()

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      isStale: false,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    const now = Date.now()
    const age = now - item.timestamp

    // If data is expired, remove it immediately
    if (age > this.STALE_WHILE_REVALIDATE_TTL) {
      this.cache.delete(key)
      return null
    }

    // Mark as stale if past TTL but still within stale-while-revalidate window
    if (age > item.ttl) {
      item.isStale = true
    }

    return item.data as T
  }

  isStale(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return true

    const now = Date.now()
    const age = now - item.timestamp
    return age > item.ttl
  }

  getWithRefresh<T>(key: string, refreshFn: () => Promise<T>): T | null {
    const data = this.get<T>(key)

    if (data && this.isStale(key) && !this.refreshPromises.has(key)) {
      this.refreshPromises.set(
        key,
        refreshFn()
          .then((freshData) => {
            this.set(key, freshData)
            return freshData
          })
          .catch((error) => {
            console.error(`Background refresh failed for ${key}:`, error)
            return data
          })
          .finally(() => {
            this.refreshPromises.delete(key)
          }),
      )
    }

    return data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.refreshPromises.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        this.refreshPromises.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
    this.refreshPromises.clear()
  }

  async forceRefresh<T>(key: string, refreshFn: () => Promise<T>): Promise<T> {
    this.invalidate(key)
    const data = await refreshFn()
    this.set(key, data)
    return data
  }

  // Aggressive cache clearing for admin operations
  clearAll(): void {
    console.log('Clearing all cache data')
    this.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      refreshing: this.refreshPromises.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const dataCache = new DataCache()

// Cache keys with shorter TTLs
export const CACHE_KEYS = {
  CURRENCIES: "currencies",
  EXCHANGE_RATES: "exchange_rates",
  USER_RECIPIENTS: (userId: string) => `user_recipients_${userId}`,
  PAYMENT_METHODS: "payment_methods",
  USER_TRANSACTIONS: (userId: string) => `user_transactions_${userId}`,
  TRANSACTION: (transactionId: string) => `transaction_${transactionId}`,
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
} as const
