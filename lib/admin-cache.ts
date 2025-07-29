interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class AdminDataCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private intervals = new Map<string, NodeJS.Timeout>()

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
    const interval = this.intervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(key)
    }
  }

  // Set up auto-refresh for a specific cache key
  setupAutoRefresh<T>(key: string, fetchFunction: () => Promise<T>, interval: number = this.DEFAULT_TTL): void {
    // Clear existing interval if any
    const existingInterval = this.intervals.get(key)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Set up new interval
    const newInterval = setInterval(async () => {
      try {
        const data = await fetchFunction()
        this.set(key, data)
      } catch (error) {
        console.error(`Auto-refresh failed for ${key}:`, error)
      }
    }, interval)

    this.intervals.set(key, newInterval)
  }

  clearAutoRefresh(key: string): void {
    const interval = this.intervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(key)
    }
  }

  clear(): void {
    this.cache.clear()
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()
  }

  // Check if data exists and is fresh
  isFresh(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const now = Date.now()
    return now - item.timestamp <= item.ttl
  }
}

export const adminCache = new AdminDataCache()

// Cache keys for admin data
export const ADMIN_CACHE_KEYS = {
  DASHBOARD_STATS: "admin_dashboard_stats",
  TRANSACTIONS: "admin_transactions",
  USERS: "admin_users",
  SETTINGS: "admin_settings",
  EXCHANGE_RATES: "admin_exchange_rates",
} as const
