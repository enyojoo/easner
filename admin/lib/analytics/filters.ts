/** The Website tab's filter rules. Pure, so node's test runner reads it too. */
import { postSlugFromPath } from "./paths.ts"
import { BLOG_PATH, SITE_PATH, type Dimension } from "./types.ts"

/** The Website tab's filters, kept in the URL so a view can be shared: `?country=NG`, `?device=mobile`, `?source=search`, `?page=/pricing`, `?compare=0`. */
export type SiteFilters = { country: string; device: string; source: string; page: string }
export const FILTER_KEYS = ["country", "device", "source", "page"] as const
export type FilterKey = (typeof FILTER_KEYS)[number]

export function readFilters(get: (key: string) => string | null): SiteFilters {
  return { country: get("country") ?? "", device: get("device") ?? "", source: get("source") ?? "", page: get("page") ?? "" }
}

/** The rollups count country, device and source each on their own, so one of the three at a time can narrow the numbers. The page filter combines with it. */
export function activeDimension(filters: SiteFilters): { dimension: Extract<Dimension, "country" | "device" | "source">; value: string } | null {
  if (filters.country) return { dimension: "country", value: filters.country }
  if (filters.device) return { dimension: "device", value: filters.device }
  if (filters.source) return { dimension: "source", value: filters.source }
  return null
}

/**
 * The nightly job writes country, device, source and referrer rows for the whole site, the blog and each blog post, and
 * nothing for other pages. So a page filter on, say, /pricing narrows the key numbers and the chart (site_stats_daily has
 * every page) but not the lists, and cannot combine with a country, device or source filter.
 */
export const hasBreakdowns = (path: string): boolean => path === SITE_PATH || path === BLOG_PATH || postSlugFromPath(path) !== null

/** The filters after `key` changes: one of country, device and source at a time, and a page without breakdown rows stands alone. */
export function nextFilterPatch(current: SiteFilters, key: FilterKey, value: string): Record<string, string | null> {
  const patch: Record<string, string | null> = { [key]: value || null }
  if (key === "page") {
    if (value && !hasBreakdowns(value)) for (const k of ["country", "device", "source"] as const) patch[k] = null
    return patch
  }
  if (value) {
    for (const k of ["country", "device", "source"] as const) if (k !== key) patch[k] = null
    if (current.page && !hasBreakdowns(current.page)) patch.page = null
  }
  return patch
}

