interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class AdminCache {
  private cache = new Map<string, CacheItem<any>>()
  private refreshIntervals = new Map<string, NodeJS.Timeout>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.refreshIntervals.forEach((interval) => clearInterval(interval))
    this.refreshIntervals.clear()
  }

  setupAutoRefresh<T>(key: string, fetchFunction: () => Promise<T>, interval: number = 5 * 60 * 1000): void {
    // Clear existing interval if any
    const existingInterval = this.refreshIntervals.get(key)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Set up new interval
    const intervalId = setInterval(async () => {
      try {
        const data = await fetchFunction()
        this.set(key, data)
      } catch (error) {
        console.error(`Auto-refresh failed for ${key}:`, error)
      }
    }, interval)

    this.refreshIntervals.set(key, intervalId)
  }

  clearAutoRefresh(key: string): void {
    const interval = this.refreshIntervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.refreshIntervals.delete(key)
    }
  }
}

export const adminCache = new AdminCache()

export const ADMIN_CACHE_KEYS = {
  DASHBOARD_STATS: "dashboard_stats",
  TRANSACTIONS: "transactions",
  USERS: "users",
  EXCHANGE_RATES: "exchange_rates",
  SETTINGS: "settings",
} as const
