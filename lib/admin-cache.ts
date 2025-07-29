interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class AdminDataCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private refreshIntervals = new Map<string, NodeJS.Timeout>()

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
    // Clear any refresh interval for this key
    const interval = this.refreshIntervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.refreshIntervals.delete(key)
    }
  }

  // Set up auto-refresh for a specific cache key
  setupAutoRefresh<T>(key: string, fetchFunction: () => Promise<T>, interval: number = this.DEFAULT_TTL): void {
    // Clear existing interval if any
    const existingInterval = this.refreshIntervals.get(key)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Set up new interval
    const refreshInterval = setInterval(async () => {
      try {
        const data = await fetchFunction()
        this.set(key, data)
      } catch (error) {
        console.error(`Auto-refresh failed for ${key}:`, error)
      }
    }, interval)

    this.refreshIntervals.set(key, refreshInterval)
  }

  clearAutoRefresh(key: string): void {
    const interval = this.refreshIntervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.refreshIntervals.delete(key)
    }
  }

  clear(): void {
    this.cache.clear()
    // Clear all intervals
    this.refreshIntervals.forEach((interval) => clearInterval(interval))
    this.refreshIntervals.clear()
  }

  // Get cache stats for debugging
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      intervals: Array.from(this.refreshIntervals.keys()),
    }
  }
}

export const adminCache = new AdminDataCache()

// Cache keys for admin data
export const ADMIN_CACHE_KEYS = {
  DASHBOARD_STATS: "admin_dashboard_stats",
  TRANSACTIONS: "admin_transactions",
  USERS: "admin_users",
  EXCHANGE_RATES: "admin_exchange_rates",
  PAYMENT_METHODS: "admin_payment_methods",
  SYSTEM_SETTINGS: "admin_system_settings",
} as const
