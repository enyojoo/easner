interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  isStale?: boolean
}

class DataCache {
  private cache = new Map<string, CacheItem<unknown>>()
  private readonly DEFAULT_TTL = 2 * 60 * 1000
  private readonly STALE_TTL = 5 * 60 * 1000
  private refreshPromises = new Map<string, Promise<unknown>>()

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl, isStale: false })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    const age = Date.now() - item.timestamp
    if (age > this.STALE_TTL) {
      this.cache.delete(key)
      return null
    }
    if (age > item.ttl) item.isStale = true
    return item.data as T
  }

  isStale(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return true
    return Date.now() - item.timestamp > item.ttl
  }

  getWithRefresh<T>(key: string, refreshFn: () => Promise<T>): T | null {
    const data = this.get<T>(key)
    if (data && this.isStale(key) && !this.refreshPromises.has(key)) {
      this.refreshPromises.set(
        key,
        refreshFn()
          .then((fresh) => {
            this.set(key, fresh)
            return fresh
          })
          .catch(() => data)
          .finally(() => this.refreshPromises.delete(key))
      )
    }
    return data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.refreshPromises.delete(key)
  }
}

export const dataCache = new DataCache()
export const CACHE_KEYS = {
  CURRENCIES: "currencies",
  EXCHANGE_RATES: "exchange_rates",
} as const
