/**
 * PostHog adapter: HogQL queries for one day, and the parsing of their results into rollup rows.
 *
 * `createHogQLRunner` is the only part that touches the network; everything else takes a `HogQLRunner`, so it is tested
 * with recorded results (posthog.test.ts). Days are in the PostHog project's timezone (set the project to UTC).
 *
 * Events and properties come from the website (website/lib/marketing/analytics.ts): `$pageview` (manual),
 * `$pageleave`, `cta_clicked`, `post_shared`, `blog_read_depth`, `$web_vitals`, UTM super properties, GeoIP.
 */
import { classifySource } from "./classify.ts"
import { normalizePath, postSlugFromPath } from "./paths.ts"
import {
  BLOG_PATH,
  SITE_PATH,
  type BreakdownRow,
  type Dimension,
  type PostHogDay,
  type SiteStatsRow,
  type VitalMetric,
  type VitalsRow,
} from "./types.ts"

export interface HogQLResult {
  columns?: string[]
  results: unknown[][]
}
/** Runs one named HogQL query. `name` is for logs and fixtures. */
export type HogQLRunner = (name: string, query: string) => Promise<HogQLResult>

export interface PostHogConfig {
  host: string
  projectId: string
  apiKey: string
}

export function createHogQLRunner(config: PostHogConfig, fetchImpl: typeof fetch = fetch): HogQLRunner {
  return async (name, query) => {
    const response = await fetchImpl(`${config.host}/api/projects/${encodeURIComponent(config.projectId)}/query/`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ name: `easner-admin rollup: ${name}`, query: { kind: "HogQLQuery", query } }),
      signal: AbortSignal.timeout(60_000),
    })
    if (!response.ok) throw new Error(`PostHog ${response.status} on ${name}`)
    const body = (await response.json()) as HogQLResult
    return { columns: body.columns, results: Array.isArray(body.results) ? body.results : [] }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------------------------------------------

const DIMENSION_PROPERTY: Array<[Dimension, string]> = [
  ["country", "properties.$geoip_country_code"],
  ["region", "concat(properties.$geoip_subdivision_1_name, ', ', properties.$geoip_country_code)"],
  ["city", "concat(properties.$geoip_city_name, ', ', properties.$geoip_country_code)"],
  ["device", "properties.$device_type"],
  ["browser", "properties.$browser"],
  ["os", "properties.$os"],
  ["utm_campaign", "properties.utm_campaign"],
]

type Scope = "site" | "blog" | "post"
const SCOPES: Scope[] = ["site", "blog", "post"]
const IN_BLOG = "(properties.$pathname = '/blog' or properties.$pathname like '/blog/%')"
const CONVERSION_TYPES = ["business_signup", "personal_app", "download", "dialog"]
const SIGNUP_TYPES = ["business_signup", "personal_app"]

const dayOf = (day: string) => `toDate(timestamp) = toDate('${day}')`
const pageview = (day: string) => `event = '$pageview' and ${dayOf(day)}`

function scopeWhere(scope: Scope): string {
  return scope === "site" ? "" : ` and ${IN_BLOG}`
}
function scopeSelect(scope: Scope): string {
  return scope === "post" ? "properties.$pathname as path, " : ""
}
function scopeGroup(scope: Scope, extra: string): string {
  return scope === "post" ? `path, ${extra}` : extra
}

export function hogqlQueries(day: string): Array<{ name: string; query: string }> {
  const out: Array<{ name: string; query: string }> = []
  const add = (name: string, query: string) => out.push({ name, query })

  add("pages", `select properties.$pathname as path, count() as views, count(distinct distinct_id) as visitors from events where ${pageview(day)} group by path order by views desc limit 2000`)
  add("totals_site", `select count() as views, count(distinct distinct_id) as visitors from events where ${pageview(day)}`)
  add("totals_blog", `select count() as views, count(distinct distinct_id) as visitors from events where ${pageview(day)} and ${IN_BLOG}`)
  add(
    "time",
    `select properties.$prev_pageview_pathname as path, avg(toFloat(properties.$prev_pageview_duration)) as secs, count() as n from events where event = '$pageleave' and ${dayOf(day)} and properties.$prev_pageview_duration is not null group by path limit 2000`,
  )
  add(
    "sessions",
    `select entry, exit, if(pvs = 1, 1, 0) as bounce, count() as sessions from (select argMin(properties.$pathname, timestamp) as entry, argMax(properties.$pathname, timestamp) as exit, count() as pvs from events where ${pageview(day)} group by properties.$session_id) group by entry, exit, bounce limit 5000`,
  )
  add(
    "ctas",
    `select properties.page_path as path, properties.destination_type as kind, count() as n from events where event = 'cta_clicked' and ${dayOf(day)} group by path, kind limit 5000`,
  )
  for (const scope of SCOPES) {
    for (const [dimension, expression] of DIMENSION_PROPERTY) {
      add(
        `dim_${dimension}_${scope}`,
        `select ${scopeSelect(scope)}${expression} as value, count(distinct distinct_id) as visitors, count() as views from events where ${pageview(day)}${scopeWhere(scope)} and value is not null and value != '' and value != ', ' group by ${scopeGroup(scope, "value")} order by visitors desc limit 3000`,
      )
    }
    add(
      `referrers_${scope}`,
      `select ${scopeSelect(scope)}properties.$referring_domain as domain, properties.utm_source as utm_source, properties.utm_medium as utm_medium, count(distinct distinct_id) as visitors, count() as views from events where ${pageview(day)}${scopeWhere(scope)} group by ${scopeGroup(scope, "domain, utm_source, utm_medium")} order by visitors desc limit 3000`,
    )
  }
  add("share_clicks", `select properties.slug as slug, properties.network as network, count() as n from events where event = 'post_shared' and ${dayOf(day)} group by slug, network limit 2000`)
  add(
    "share_visits",
    `select properties.$pathname as path, properties.utm_source as source, count(distinct distinct_id) as visitors, count() as views from events where ${pageview(day)} and properties.utm_medium = 'share' group by path, source limit 2000`,
  )
  add("read_depth", `select properties.slug as slug, toInt(properties.depth) as depth, count(distinct distinct_id) as readers from events where event = 'blog_read_depth' and ${dayOf(day)} group by slug, depth limit 4000`)

  const vitalColumns = (["LCP", "INP", "CLS", "FCP"] as VitalMetric[])
    .map(
      (m) =>
        `quantile(0.75)(toFloat(properties.$web_vitals_${m}_value)) as ${m.toLowerCase()}, countIf(properties.$web_vitals_${m}_value is not null) as ${m.toLowerCase()}_n`,
    )
    .join(", ")
  add("vitals_path", `select properties.$pathname as path, ${vitalColumns} from events where event = '$web_vitals' and ${dayOf(day)} group by path limit 2000`)
  add("vitals_site", `select ${vitalColumns} from events where event = '$web_vitals' and ${dayOf(day)}`)
  return out
}

// ---------------------------------------------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------------------------------------------

const num = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}
const text = (value: unknown): string => (value === null || value === undefined ? "" : String(value))
const isBlogPath = (path: string) => path === "/blog" || path.startsWith("/blog/")
const round = (value: number, places = 2) => Math.round(value * 10 ** places) / 10 ** places

type Raw = Record<string, unknown[][]>

class Sums {
  private map = new Map<string, BreakdownRow>()
  private day: string
  constructor(day: string) {
    this.day = day
  }
  add(path: string, dimension: Dimension, value: string, visitors: number, views: number) {
    if (!value) return
    const key = `${path}\u0000${dimension}\u0000${value}`
    const row = this.map.get(key) ?? { date: this.day, path, dimension, value, visitors: 0, views: 0 }
    row.visitors += visitors
    row.views += views
    this.map.set(key, row)
  }
  rows(): BreakdownRow[] {
    return [...this.map.values()]
  }
}

/** Pure: raw query results (by query name) to the day's rollup rows. */
export function buildPostHogDay(day: string, raw: Raw): PostHogDay {
  const rows = (name: string) => raw[name] ?? []

  // Pages.
  const pages = new Map<string, { views: number; visitors: number }>()
  for (const [p, views, visitors] of rows("pages")) {
    const path = normalizePath(text(p))
    const cur = pages.get(path) ?? { views: 0, visitors: 0 }
    cur.views += num(views)
    cur.visitors += num(visitors)
    pages.set(path, cur)
  }

  // Time on page, weighted.
  const time = new Map<string, { secs: number; n: number }>()
  for (const [p, secs, n] of rows("time")) {
    const path = normalizePath(text(p))
    const cur = time.get(path) ?? { secs: 0, n: 0 }
    cur.secs += num(secs) * num(n)
    cur.n += num(n)
    time.set(path, cur)
  }
  const avgTime = (match: (path: string) => boolean): number | null => {
    let secs = 0
    let n = 0
    for (const [path, t] of time) if (match(path)) { secs += t.secs; n += t.n }
    return n > 0 ? round(secs / n, 1) : null
  }

  // Sessions: entries, exits, bounces.
  const entries = new Map<string, number>()
  const exits = new Map<string, number>()
  const bounces = new Map<string, number>()
  const bump = (m: Map<string, number>, path: string, by: number) => m.set(path, (m.get(path) ?? 0) + by)
  for (const [entry, exit, bounce, sessions] of rows("sessions")) {
    const e = normalizePath(text(entry))
    const x = normalizePath(text(exit))
    bump(entries, e, num(sessions))
    bump(exits, x, num(sessions))
    if (num(bounce) === 1) bump(bounces, e, num(sessions))
  }
  const sumWhere = (m: Map<string, number>, match: (path: string) => boolean) => {
    let total = 0
    for (const [path, n] of m) if (match(path)) total += n
    return total
  }

  // CTAs.
  const conversions = new Map<string, number>()
  const signups = new Map<string, number>()
  const ctas = new Map<string, number>()
  for (const [p, kind, n] of rows("ctas")) {
    const path = normalizePath(text(p))
    bump(ctas, path, num(n))
    if (CONVERSION_TYPES.includes(text(kind))) bump(conversions, path, num(n))
    if (SIGNUP_TYPES.includes(text(kind))) bump(signups, path, num(n))
  }

  const [siteViews = 0, siteVisitors = 0] = (rows("totals_site")[0] ?? []).map(num)
  const [blogViews = 0, blogVisitors = 0] = (rows("totals_blog")[0] ?? []).map(num)

  const siteStats: SiteStatsRow[] = [
    {
      date: day, path: SITE_PATH, visitors: siteVisitors, views: siteViews, avg_time_s: avgTime(() => true),
      bounces: sumWhere(bounces, () => true), exits: sumWhere(exits, () => true), entries: sumWhere(entries, () => true),
      conversions: sumWhere(conversions, () => true),
    },
    {
      date: day, path: BLOG_PATH, visitors: blogVisitors, views: blogViews, avg_time_s: avgTime(isBlogPath),
      bounces: sumWhere(bounces, isBlogPath), exits: sumWhere(exits, isBlogPath), entries: sumWhere(entries, isBlogPath),
      conversions: sumWhere(conversions, isBlogPath),
    },
  ]
  for (const [path, p] of pages) {
    const t = time.get(path)
    siteStats.push({
      date: day, path, visitors: p.visitors, views: p.views,
      avg_time_s: t && t.n > 0 ? round(t.secs / t.n, 1) : null,
      bounces: bounces.get(path) ?? 0, exits: exits.get(path) ?? 0, entries: entries.get(path) ?? 0,
      conversions: conversions.get(path) ?? 0,
    })
  }

  // Breakdowns.
  const sums = new Sums(day)
  const scopePath = (scope: Scope, raw: unknown): string | null => {
    if (scope === "site") return SITE_PATH
    if (scope === "blog") return BLOG_PATH
    const path = normalizePath(text(raw))
    return postSlugFromPath(path) ? path : null
  }
  for (const scope of SCOPES) {
    for (const [dimension] of DIMENSION_PROPERTY) {
      for (const r of rows(`dim_${dimension}_${scope}`)) {
        const offset = scope === "post" ? 1 : 0
        const path = scopePath(scope, r[0])
        if (!path) continue
        sums.add(path, dimension, text(r[offset]), num(r[offset + 1]), num(r[offset + 2]))
      }
    }
    for (const r of rows(`referrers_${scope}`)) {
      const offset = scope === "post" ? 1 : 0
      const path = scopePath(scope, r[0])
      if (!path) continue
      const domain = text(r[offset])
      const utmSource = text(r[offset + 1])
      const utmMedium = text(r[offset + 2])
      const visitors = num(r[offset + 3])
      const views = num(r[offset + 4])
      const channel = classifySource(domain, utmSource, utmMedium)
      sums.add(path, "source", channel, visitors, views)
      sums.add(path, "referrer", !domain || domain === "$direct" ? "direct" : domain.replace(/^www\./, ""), visitors, views)
    }
  }

  // Shares: clicks by network (events) and the visits they brought back (utm_medium=share).
  const shareClicks = new Map<string, Record<string, number>>()
  for (const [slug, network, n] of rows("share_clicks")) {
    const s = text(slug)
    const net = text(network) || "other"
    if (!s) continue
    const cur = shareClicks.get(s) ?? {}
    cur[net] = (cur[net] ?? 0) + num(n)
    shareClicks.set(s, cur)
    for (const path of [SITE_PATH, BLOG_PATH, `/blog/${s}`]) sums.add(path, "share_click", net, num(n), num(n))
  }
  const shareVisits = new Map<string, number>()
  for (const [p, source, visitors, views] of rows("share_visits")) {
    const path = normalizePath(text(p))
    const slug = postSlugFromPath(path)
    if (!slug) continue
    const net = text(source) || "other"
    bump(shareVisits, slug, num(views))
    for (const target of [SITE_PATH, BLOG_PATH, path]) sums.add(target, "share_visit", net, num(visitors), num(views))
  }

  // Read depth.
  const depth = new Map<string, Record<number, number>>()
  for (const [slug, d, readers] of rows("read_depth")) {
    const s = text(slug)
    if (!s) continue
    const cur = depth.get(s) ?? {}
    cur[num(d)] = (cur[num(d)] ?? 0) + num(readers)
    depth.set(s, cur)
  }

  // Per-post stats.
  const breakdowns = sums.rows()
  const blogStats: PostHogDay["blogStats"] = []
  for (const [path, p] of pages) {
    const slug = postSlugFromPath(path)
    if (!slug) continue
    const d = depth.get(slug) ?? {}
    const clicks = shareClicks.get(slug) ?? {}
    const sources: Record<string, number> = {}
    for (const b of breakdowns) if (b.path === path && b.dimension === "source") sources[b.value] = b.visitors
    const t = time.get(path)
    blogStats.push({
      slug, date: day, views: p.views, readers: p.visitors,
      depth_25: d[25] ?? 0, depth_50: d[50] ?? 0, depth_75: d[75] ?? 0, depth_100: d[100] ?? 0,
      cta_clicks: ctas.get(path) ?? 0, signups: signups.get(path) ?? 0,
      share_clicks: Object.values(clicks).reduce((a, b) => a + b, 0), share_visits: shareVisits.get(slug) ?? 0,
      avg_time_s: t && t.n > 0 ? round(t.secs / t.n, 1) : null, sources, shares: clicks,
    })
  }

  // Web vitals.
  const vitals: VitalsRow[] = []
  const metrics: VitalMetric[] = ["LCP", "INP", "CLS", "FCP"]
  const pushVitals = (path: string, cols: unknown[]) => {
    metrics.forEach((metric, i) => {
      const p75 = Number(cols[i * 2])
      const samples = num(cols[i * 2 + 1])
      if (Number.isFinite(p75) && samples > 0) vitals.push({ date: day, path, metric, p75: round(p75, 3), samples })
    })
  }
  for (const r of rows("vitals_site")) pushVitals(SITE_PATH, r)
  for (const r of rows("vitals_path")) pushVitals(normalizePath(text(r[0])), r.slice(1))

  return { day, siteStats, breakdowns, vitals, blogStats }
}

/** Runs every query for `day` (a few at a time) and builds the rollup rows. Throws if any query fails. */
export async function fetchPostHogDay(run: HogQLRunner, day: string, concurrency = 4): Promise<PostHogDay> {
  const queries = hogqlQueries(day)
  const raw: Raw = {}
  let next = 0
  const worker = async () => {
    while (next < queries.length) {
      const q = queries[next++]
      raw[q.name] = (await run(q.name, q.query)).results
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, queries.length) }, worker))
  return buildPostHogDay(day, raw)
}
