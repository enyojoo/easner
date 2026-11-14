/**
 * Deterministic sample data for reviewing the dashboard without PostHog keys (dev harness only: /dev/analytics).
 * Same seed and same `today` give the same numbers. Rows have the shape of the rollup tables, and the source below
 * sums them the way the SQL functions do, so the UI runs the same code path as production.
 */
import { addDays } from "./paths.ts"
import type { AnalyticsSource, BreakdownValue, DateRange, FeedbackRow, PageRow, SearchQueryRow, TopPostRow, VitalAgg } from "./source.ts"
import { BLOG_PATH, SITE_PATH, type BlogStatsRow, type BreakdownRow, type Dimension, type SiteStatsRow, type VitalMetric } from "./types.ts"

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const SAMPLE_POSTS = [
  { id: "00000000-0000-4000-8000-000000000001", slug: "send-money-to-nigeria", title: "How to send money to Nigeria without losing it to fees", category: "Sending money", weight: 1, ageDays: 80 },
  { id: "00000000-0000-4000-8000-000000000002", slug: "pay-contractors-in-kenya", title: "Paying contractors in Kenya: what small teams get wrong", category: "Business", weight: 0.8, ageDays: 52 },
  { id: "00000000-0000-4000-8000-000000000003", slug: "usd-account-for-freelancers", title: "A US dollar account for freelancers, explained", category: "Freelancers", weight: 0.65, ageDays: 33 },
  { id: "00000000-0000-4000-8000-000000000004", slug: "what-is-a-stablecoin", title: "What is a stablecoin, in plain words", category: "Money basics", weight: 0.5, ageDays: 21 },
  { id: "00000000-0000-4000-8000-000000000005", slug: "cheapest-way-to-pay-philippines", title: "The cheapest way to pay a team in the Philippines", category: "Business", weight: 0.4, ageDays: 12 },
  { id: "00000000-0000-4000-8000-000000000006", slug: "invoice-international-clients", title: "How to invoice international clients and get paid on time", category: "Freelancers", weight: 0.3, ageDays: 5 },
] as const

const COUNTRIES: Array<[string, number]> = [["NG", 30], ["KE", 14], ["GH", 9], ["US", 12], ["GB", 8], ["MX", 7], ["PH", 6], ["IN", 5], ["ZA", 4], ["CA", 3], ["DE", 2], ["BR", 2]]
const CITIES: Array<[string, number]> = [
  ["Lagos, NG", 16], ["Abuja, NG", 6], ["Nairobi, KE", 10], ["Accra, GH", 6], ["London, GB", 5], ["New York, US", 4], ["Mexico City, MX", 4],
  ["Manila, PH", 4], ["Mumbai, IN", 2.5], ["Port Harcourt, NG", 1.1], ["Kisumu, KE", 0.9], ["Kumasi, GH", 0.8], ["Guadalajara, MX", 0.7],
  ["Cebu City, PH", 0.6], ["Johannesburg, ZA", 2], ["Toronto, CA", 1.2], ["Berlin, DE", 0.04], ["Lisbon, PT", 0.03], ["Enugu, NG", 0.02], ["Tamale, GH", 0.03],
]
const DEVICES: Array<[string, number]> = [["Mobile", 64], ["Desktop", 33], ["Tablet", 3]]
const BROWSERS: Array<[string, number]> = [["Chrome", 58], ["Safari", 24], ["Samsung Internet", 7], ["Firefox", 5], ["Edge", 4], ["Opera Mini", 2]]
const OSES: Array<[string, number]> = [["Android", 48], ["iOS", 22], ["Windows", 16], ["Mac OS X", 11], ["Linux", 3]]
const CHANNELS: Array<[string, number]> = [["search", 36], ["direct", 28], ["social", 14], ["ai", 9], ["referral", 7], ["email", 4], ["paid", 2]]
const REFERRERS: Array<[string, number]> = [["direct", 28], ["google.com", 34], ["chatgpt.com", 6], ["linkedin.com", 6], ["x.com", 5], ["perplexity.ai", 2], ["wa.me", 2], ["news.ycombinator.com", 1.5], ["reddit.com", 1.5], ["gemini.google.com", 1]]
const CAMPAIGNS: Array<[string, number]> = [["nigeria-launch", 40], ["freelancer-guide", 25], ["dispatch-nov", 20], ["partner-spring", 8]]
const SHARES: Array<[string, number]> = [["linkedin", 38], ["x", 26], ["whatsapp", 24], ["copy", 9], ["native", 3]]
const PAGES: Array<[string, number, number]> = [["/", 100, 28], ["/personal", 30, 45], ["/business", 28, 52], ["/pricing", 22, 60], ["/cards", 12, 40], ["/invoicing", 9, 70], ["/stablecoin", 8, 55], ["/about", 6, 30], ["/partners", 5, 35], ["/blog", 10, 38], ["/contact", 3, 20]]
const QUERIES: Array<[string, number, number]> = [
  ["send money to nigeria", 900, 4.1], ["cheapest way to send money to kenya", 640, 6.3], ["usd account for freelancers", 520, 5.2], ["pay contractors in kenya", 410, 3.8],
  ["what is a stablecoin", 380, 9.4], ["easner", 300, 1.2], ["invoice international clients", 260, 7.7], ["western union alternative nigeria", 210, 8.9],
  ["receive dollars in ghana", 190, 6.8], ["pay team in the philippines", 150, 5.5], ["open a us bank account from nigeria", 120, 11.2],
]

export interface SampleData {
  today: string
  site: SiteStatsRow[]
  breakdowns: BreakdownRow[]
  blog: BlogStatsRow[]
  vitals: Array<{ date: string; path: string; metric: VitalMetric; p75: number; samples: number }>
  siteSearch: Array<{ date: string; path: string; query: string; impressions: number; clicks: number; position: number }>
  blogSearch: Array<{ post_id: string; date: string; query: string; impressions: number; clicks: number; position: number }>
  feedback: FeedbackRow[]
}

const DAYS = 400

export function generateSampleData(today: string, seed = 20261117): SampleData {
  const rand = rng(seed)
  const jitter = (base: number, spread = 0.18) => Math.max(0, Math.round(base * (1 + (rand() - 0.5) * 2 * spread)))
  const site: SiteStatsRow[] = []
  const breakdowns: BreakdownRow[] = []
  const blog: BlogStatsRow[] = []
  const vitals: SampleData["vitals"] = []
  const siteSearch: SampleData["siteSearch"] = []
  const blogSearch: SampleData["blogSearch"] = []

  const split = (total: number, table: Array<[string, number]>) => {
    const sum = table.reduce((a, [, w]) => a + w, 0)
    return table.map(([value, w]) => [value, Math.floor((total * w) / sum * (1 + (rand() - 0.5) * 0.3) + rand())] as const)
  }

  for (let i = DAYS - 1; i >= 0; i--) {
    const date = addDays(today, -1 - i)
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay()
    const weekend = dow === 0 || dow === 6 ? 0.72 : 1
    const growth = 0.55 + (0.45 * (DAYS - i)) / DAYS
    const visitors = jitter(210 * weekend * growth)
    const views = Math.round(visitors * (1.7 + rand() * 0.3))
    const entries = Math.round(visitors * 1.05)
    site.push({ date, path: SITE_PATH, visitors, views, avg_time_s: 38 + Math.round(rand() * 12), bounces: Math.round(entries * 0.46), exits: entries, entries, conversions: Math.round(visitors * (0.045 + rand() * 0.01)) })
    for (const [path, share, time] of PAGES) {
      const pv = Math.round((views * share) / 100 * (1 + (rand() - 0.5) * 0.25))
      const pvv = Math.round(pv * 0.78)
      site.push({ date, path, visitors: pvv, views: pv, avg_time_s: time + Math.round(rand() * 8), bounces: Math.round(pvv * 0.4), exits: Math.round(pvv * 0.5), entries: Math.round(pvv * 0.55), conversions: path === "/" || path === "/pricing" ? Math.round(pvv * 0.08) : Math.round(pvv * 0.02) })
    }

    let blogViews = 0, blogVisitors = 0, blogSignups = 0, blogEntries = 0
    for (const post of SAMPLE_POSTS) {
      if (post.ageDays < i + 1 - 0 && i + 1 > DAYS) continue
      const live = i + 1 <= post.ageDays
      if (!live) continue
      const age = post.ageDays - i
      const launch = age < 4 ? 1.8 : 1
      const pvisitors = jitter(26 * post.weight * weekend * launch * (0.7 + Math.min(age, 40) / 60))
      const pviews = Math.round(pvisitors * (1.1 + rand() * 0.1))
      const readers = pvisitors
      const clicks = split(Math.round(pvisitors * 0.07), SHARES)
      const shareClicks = clicks.reduce((a, [, n]) => a + n, 0)
      const sources: Record<string, number> = {}
      for (const [channel, n] of split(pvisitors, CHANNELS)) sources[channel] = n
      blog.push({
        post_id: post.id, date, views: pviews, readers,
        depth_25: Math.round(readers * 0.82), depth_50: Math.round(readers * 0.56), depth_75: Math.round(readers * 0.34), depth_100: Math.round(readers * 0.19),
        cta_clicks: Math.round(readers * 0.06), signups: Math.round(readers * 0.012), share_clicks: shareClicks, share_visits: Math.round(shareClicks * 1.6),
        avg_time_s: 95 + Math.round(rand() * 40), sources, shares: Object.fromEntries(clicks.filter(([, n]) => n > 0)),
      })
      blogViews += pviews; blogVisitors += pvisitors; blogSignups += Math.round(readers * 0.012); blogEntries += Math.round(pvisitors * 0.8)
      const path = `/blog/${post.slug}`
      site.push({ date, path, visitors: pvisitors, views: pviews, avg_time_s: 95 + Math.round(rand() * 40), bounces: Math.round(pvisitors * 0.35), exits: Math.round(pvisitors * 0.6), entries: Math.round(pvisitors * 0.8), conversions: Math.round(pvisitors * 0.012) })
      const add = (dimension: Dimension, table: Array<[string, number]>, scopePath: string, total: number) => {
        for (const [value, n] of split(total, table)) if (n > 0) breakdowns.push({ date, path: scopePath, dimension, value, visitors: n, views: Math.round(n * 1.15) })
      }
      for (const dim of [["country", COUNTRIES], ["city", CITIES], ["device", DEVICES], ["source", CHANNELS], ["referrer", REFERRERS]] as const) add(dim[0], dim[1], path, pvisitors)
      for (const [value, n] of clicks) if (n > 0) breakdowns.push({ date, path, dimension: "share_click", value, visitors: n, views: n })
      for (const [value, n] of clicks) if (n > 0) breakdowns.push({ date, path, dimension: "share_visit", value, visitors: Math.round(n * 1.4), views: Math.round(n * 1.6) })
      const queries = QUERIES.slice(0, 5 + Math.round(post.weight * 4))
      for (const [query, imp, pos] of queries) {
        const impressions = jitter((imp * post.weight) / 12, 0.4)
        blogSearch.push({ post_id: post.id, date, query, impressions, clicks: Math.round(impressions * (0.12 - pos * 0.007 > 0.01 ? 0.12 - pos * 0.007 : 0.01)), position: Math.round((pos + (rand() - 0.5)) * 10) / 10 })
      }
    }
    site.push({ date, path: BLOG_PATH, visitors: blogVisitors, views: blogViews, avg_time_s: 105, bounces: Math.round(blogEntries * 0.4), exits: blogEntries, entries: blogEntries, conversions: blogSignups })

    const scopes: Array<[string, number]> = [[SITE_PATH, visitors], [BLOG_PATH, Math.max(blogVisitors, 1)]]
    for (const [scopePath, total] of scopes) {
      const mix = (dimension: Dimension, table: Array<[string, number]>) => {
        for (const [value, n] of split(total, table)) if (n > 0) breakdowns.push({ date, path: scopePath, dimension, value, visitors: n, views: Math.round(n * 1.3) })
      }
      mix("country", COUNTRIES); mix("city", CITIES); mix("device", DEVICES); mix("browser", BROWSERS); mix("os", OSES)
      mix("source", CHANNELS); mix("referrer", REFERRERS); mix("utm_campaign", CAMPAIGNS)
      const siteClicks = split(Math.round(total * 0.012), SHARES)
      for (const [value, n] of siteClicks) if (n > 0) {
        breakdowns.push({ date, path: scopePath, dimension: "share_click", value, visitors: n, views: n })
        breakdowns.push({ date, path: scopePath, dimension: "share_visit", value, visitors: Math.round(n * 1.4), views: Math.round(n * 1.6) })
      }
    }
    for (const [path, lcp, inp, cls] of [[SITE_PATH, 2150, 160, 0.06], ["/", 1900, 140, 0.04], ["/pricing", 2650, 210, 0.09], ["/blog", 2300, 150, 0.12], ["/cards", 3100, 280, 0.05]] as const) {
      const samples = path === SITE_PATH ? Math.round(visitors * 0.8) : Math.round(visitors * 0.2)
      for (const [metric, value] of [["LCP", lcp], ["INP", inp], ["CLS", cls], ["FCP", lcp * 0.65]] as const) vitals.push({ date, path, metric, p75: Math.round(value * (0.95 + rand() * 0.1) * 1000) / 1000, samples })
    }
    for (const [query, imp, pos] of QUERIES) {
      const impressions = jitter(imp / 8, 0.35)
      siteSearch.push({ date, path: "/", query, impressions, clicks: Math.round(impressions * Math.max(0.01, 0.13 - pos * 0.008)), position: Math.round((pos + (rand() - 0.5)) * 10) / 10 })
    }
  }

  const feedback: FeedbackRow[] = []
  const reasons = ["out_of_date", "not_what_i_was_looking_for", "too_technical", "missing_my_country"]
  SAMPLE_POSTS.forEach((post, index) => {
    feedback.push({ post_id: post.id, helpful: true, reason: null, votes: Math.round(40 * post.weight + 3) })
    reasons.forEach((reason, r) => feedback.push({ post_id: post.id, helpful: false, reason, votes: index === 2 ? 4 + r : r === 0 ? 1 : r === 3 ? 2 : 0 }))
  })
  return { today, site, breakdowns, blog, vitals, siteSearch, blogSearch, feedback }
}

const inRange = (date: string, r: DateRange) => date >= r.from && date <= r.to

export function createSampleSource(today: string, seed?: number): AnalyticsSource {
  const data = generateSampleData(today, seed)
  const titles = new Map<string, (typeof SAMPLE_POSTS)[number]>(SAMPLE_POSTS.map((p) => [p.id, p]))
  const wait = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 60))
  return {
    status: () => wait({ state: "ready" as const, lastDay: addDays(today, -1), gsc: true }),
    daily: (path, range) => wait(data.site.filter((r) => r.path === path && inRange(r.date, range)).sort((a, b) => a.date.localeCompare(b.date))),
    pages: (range) => {
      const map = new Map<string, PageRow & { timeW: number }>()
      for (const r of data.site) {
        if (r.path === SITE_PATH || r.path === BLOG_PATH || !inRange(r.date, range)) continue
        const cur = map.get(r.path) ?? { path: r.path, views: 0, visitors: 0, avg_time_s: null, bounces: 0, exits: 0, entries: 0, conversions: 0, timeW: 0 }
        cur.views += r.views; cur.visitors += r.visitors; cur.bounces += r.bounces; cur.exits += r.exits; cur.entries += r.entries; cur.conversions += r.conversions
        cur.timeW += (r.avg_time_s ?? 0) * r.views
        map.set(r.path, cur)
      }
      return wait([...map.values()].map(({ timeW, ...row }) => ({ ...row, avg_time_s: row.views ? Math.round((timeW / row.views) * 10) / 10 : null })).sort((a, b) => b.views - a.views))
    },
    breakdown: (range, path, dimension) => {
      const map = new Map<string, BreakdownValue>()
      for (const b of data.breakdowns) {
        if (b.path !== path || b.dimension !== dimension || !inRange(b.date, range)) continue
        const cur = map.get(b.value) ?? { value: b.value, visitors: 0, views: 0 }
        cur.visitors += b.visitors; cur.views += b.views
        map.set(b.value, cur)
      }
      return wait([...map.values()].sort((a, b) => b.visitors - a.visitors))
    },
    search: (range, scope, postId) => {
      const map = new Map<string, { query: string; impressions: number; clicks: number; pos: number }>()
      const rows = scope === "site" ? data.siteSearch : data.blogSearch.filter((r) => !postId || r.post_id === postId)
      for (const r of rows) {
        if (!inRange(r.date, range)) continue
        const cur = map.get(r.query) ?? { query: r.query, impressions: 0, clicks: 0, pos: 0 }
        cur.impressions += r.impressions; cur.clicks += r.clicks; cur.pos += r.position * r.impressions
        map.set(r.query, cur)
      }
      const out: SearchQueryRow[] = [...map.values()].map((q) => ({ query: q.query, impressions: q.impressions, clicks: q.clicks, avg_position: q.impressions ? Math.round((q.pos / q.impressions) * 10) / 10 : null }))
      return wait(out.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions))
    },
    topPosts: (range, limit) => {
      const map = new Map<string, TopPostRow>()
      for (const r of data.blog) {
        if (!inRange(r.date, range)) continue
        const p = titles.get(r.post_id)!
        const cur = map.get(r.post_id) ?? { post_id: r.post_id, slug: p.slug, title: p.title, category_name: p.category, published_at: `${addDays(today, -p.ageDays)}T09:00:00Z`, views: 0, readers: 0, depth_25: 0, depth_100: 0, cta_clicks: 0, signups: 0, share_clicks: 0, share_visits: 0 }
        cur.views += r.views; cur.readers += r.readers; cur.depth_25 += r.depth_25; cur.depth_100 += r.depth_100
        cur.cta_clicks += r.cta_clicks; cur.signups += r.signups; cur.share_clicks += r.share_clicks; cur.share_visits += r.share_visits
        map.set(r.post_id, cur)
      }
      return wait([...map.values()].sort((a, b) => b.views - a.views).slice(0, limit))
    },
    postDaily: (postId, range) => wait(data.blog.filter((r) => r.post_id === postId && inRange(r.date, range)).sort((a, b) => a.date.localeCompare(b.date))),
    feedback: (postId) => wait(data.feedback.filter((f) => !postId || f.post_id === postId)),
    vitals: (range) => {
      const map = new Map<string, { path: string; metric: VitalMetric; w: number; samples: number }>()
      for (const v of data.vitals) {
        if (!inRange(v.date, range)) continue
        const key = `${v.path}|${v.metric}`
        const cur = map.get(key) ?? { path: v.path, metric: v.metric, w: 0, samples: 0 }
        cur.w += v.p75 * v.samples; cur.samples += v.samples
        map.set(key, cur)
      }
      const out: VitalAgg[] = [...map.values()].map((v) => ({ path: v.path, metric: v.metric, p75: Math.round((v.w / v.samples) * 1000) / 1000, samples: v.samples }))
      return wait(out)
    },
  }
}
