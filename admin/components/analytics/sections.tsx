"use client"

import { Fragment } from "react"
import { useBreakdown, useFeedback, useSearch, useVitals } from "@/lib/analytics/hooks"
import { CHANNEL_LABELS, isAiDomain } from "@/lib/analytics/classify"
import { countryName, formatCount, formatPercent, formatVital, groupSmall, topWithOther, vitalStatus, type VitalStatus } from "@/lib/analytics/aggregate"
import type { DateRange } from "@/lib/analytics/source"
import type { Channel, VitalMetric } from "@/lib/analytics/types"
import { BarList, Section } from "@/components/analytics/parts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type Scope = { range: DateRange; path: string }

const channelLabel = (value: string) => CHANNEL_LABELS[value as Channel] ?? value
const referrerLabel = (value: string) => (value === "direct" ? "Direct" : isAiDomain(value) ? `${value} (AI answers)` : value)
const cityLabel = (value: string) => value
const capital = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export function SourcesSection({ range, path }: Scope) {
  const channels = useBreakdown(range, path, "source")
  const referrers = useBreakdown(range, path, "referrer")
  const campaigns = useBreakdown(range, path, "utm_campaign")
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Section title="Channels" description="Where visits come from. AI answers groups ChatGPT, Perplexity, Gemini, Copilot and Claude.">
        <BarList rows={channels.data} label={channelLabel} loading={channels.isLoading} />
      </Section>
      <Section title="Referring sites" description="The sites that sent people.">
        <BarList rows={referrers.data} label={referrerLabel} loading={referrers.isLoading} />
      </Section>
      <Section title="Campaigns" description="Visits with a utm_campaign tag.">
        <BarList rows={campaigns.data} loading={campaigns.isLoading} empty="No tagged campaigns in this period." />
      </Section>
    </div>
  )
}

export function LocationSection({ range, path }: Scope) {
  const countries = useBreakdown(range, path, "country")
  const cities = useBreakdown(range, path, "city")
  const grouped = cities.data ? topWithOther(groupSmall(cities.data), 9) : undefined
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Section title="Countries" description="By visitors, from the visitor’s IP address (never stored).">
        <BarList rows={countries.data && topWithOther(countries.data, 9)} label={countryName} loading={countries.isLoading} limit={10} />
      </Section>
      <Section title="Cities" description="Cities with fewer than 5 visitors in the period are grouped as Other.">
        <BarList rows={grouped} label={cityLabel} loading={cities.isLoading} limit={10} />
      </Section>
    </div>
  )
}

export function TechSection({ range, path, compact = false }: Scope & { compact?: boolean }) {
  const devices = useBreakdown(range, path, "device")
  const browsers = useBreakdown(range, path, "browser", !compact)
  const systems = useBreakdown(range, path, "os", !compact)
  return (
    <div className={cn("grid grid-cols-1 gap-6", compact ? "" : "lg:grid-cols-3")}>
      <Section title="Devices">
        <BarList rows={devices.data} loading={devices.isLoading} />
      </Section>
      {compact ? null : (
        <>
          <Section title="Browsers">
            <BarList rows={browsers.data} loading={browsers.isLoading} />
          </Section>
          <Section title="Operating systems">
            <BarList rows={systems.data} loading={systems.isLoading} />
          </Section>
        </>
      )}
    </div>
  )
}

export function SearchSection({ range, scope, postId, title }: { range: DateRange; scope: "site" | "blog"; postId?: string; title?: string }) {
  const query = useSearch(range, scope, postId)
  const rows = (query.data ?? []).slice(0, 10)
  return (
    <Section flush title={title ?? "Google searches"} description="From Search Console. Data trails by about three days.">
      {query.isLoading ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">Loading searches.</p>
      ) : rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">No searches yet. Search Console data appears after it is connected.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.query}>
                <TableCell className="max-w-[320px] truncate font-medium">{row.query}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(row.clicks)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(row.impressions)}</TableCell>
                <TableCell className="text-right tabular-nums">{row.impressions ? formatPercent(row.clicks / row.impressions, 1) : "n/a"}</TableCell>
                <TableCell className="text-right tabular-nums">{row.avg_position === null ? "n/a" : row.avg_position.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  )
}

const STATUS_DOT: Record<VitalStatus, string> = { good: "bg-success-text", "needs improvement": "bg-warning-text", poor: "bg-muted-foreground" }
const METRICS: VitalMetric[] = ["LCP", "INP", "CLS"]

export function VitalsSection({ range }: { range: DateRange }) {
  const query = useVitals(range)
  const rows = query.data ?? []
  const paths = [...new Set(rows.map((r) => r.path))].sort((a, b) => (a === "*" ? -1 : b === "*" ? 1 : (rows.find((r) => r.path === b)?.samples ?? 0) - (rows.find((r) => r.path === a)?.samples ?? 0))).slice(0, 8)
  const cell = (path: string, metric: VitalMetric) => rows.find((r) => r.path === path && r.metric === metric)
  return (
    <Section flush title="Site health" description="Core Web Vitals at the 75th percentile of real visits. Each has a dot and a word, so it never relies on colour.">
      {query.isLoading ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">Loading vitals.</p>
      ) : paths.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">No web vitals yet. They appear a day after visitors load pages.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              {METRICS.map((m) => (
                <TableHead key={m} className="text-right">{m === "LCP" ? "Largest paint (LCP)" : m === "INP" ? "Interaction (INP)" : "Layout shift (CLS)"}</TableHead>
              ))}
              <TableHead className="text-right">Visits measured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paths.map((path) => (
              <TableRow key={path}>
                <TableCell className="font-medium">{path === "*" ? "Whole site" : path}</TableCell>
                {METRICS.map((m) => {
                  const v = cell(path, m)
                  if (!v) return <TableCell key={m} className="text-right text-muted-foreground">n/a</TableCell>
                  const status = vitalStatus(m, v.p75)
                  return (
                    <TableCell key={m} className="text-right tabular-nums">
                      <span className="inline-flex items-center justify-end gap-2">
                        <span className={cn("size-2 rounded-full", STATUS_DOT[status])} aria-hidden />
                        {formatVital(m, v.p75)}
                        <span className="w-[8.5rem] text-left text-xs text-muted-foreground">{capital(status)}</span>
                      </span>
                    </TableCell>
                  )
                })}
                <TableCell className="text-right tabular-nums">{formatCount(cell(path, "LCP")?.samples ?? 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  )
}

/** Share clicks by network and the visits they brought back (?utm_source=<network>&utm_medium=share). */
export function SharesSection({ range, path }: Scope) {
  const clicks = useBreakdown(range, path, "share_click")
  const visits = useBreakdown(range, path, "share_visit")
  const loading = clicks.isLoading || visits.isLoading
  const networks = [...new Set([...(clicks.data ?? []).map((r) => r.value), ...(visits.data ?? []).map((r) => r.value)])]
  const rows = networks
    .map((n) => ({ network: n, clicks: clicks.data?.find((r) => r.value === n)?.views ?? 0, visits: visits.data?.find((r) => r.value === n)?.views ?? 0 }))
    .sort((a, b) => b.clicks - a.clicks)
  const label: Record<string, string> = { x: "X", linkedin: "LinkedIn", whatsapp: "WhatsApp", copy: "Copy link", native: "Share sheet", facebook: "Facebook" }
  return (
    <Section flush title="Shares" description="Share button clicks, and the visits they brought back. X and LinkedIn don’t give public share counts, so these are ours.">
      {loading ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">Loading shares.</p>
      ) : rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">No shares in this period.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Network</TableHead>
              <TableHead className="text-right">Share clicks</TableHead>
              <TableHead className="text-right">Visits brought back</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <Fragment key={r.network}>
                <TableRow>
                  <TableCell className="font-medium">{label[r.network] ?? capital(r.network)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(r.clicks)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(r.visits)}</TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  )
}

const REASONS: Record<string, string> = {
  out_of_date: "Out of date",
  not_what_i_was_looking_for: "Not what I was looking for",
  too_technical: "Too technical",
  missing_my_country: "Missing my country",
}

/** "Was this helpful?" results. Admin only; counts and reasons, nothing about who voted. */
export function HelpfulSection({ postId }: { postId?: string }) {
  const query = useFeedback(postId)
  const rows = query.data ?? []
  const yes = rows.filter((r) => r.helpful).reduce((s, r) => s + r.votes, 0)
  const no = rows.filter((r) => !r.helpful).reduce((s, r) => s + r.votes, 0)
  const reasons = Object.entries(
    rows.filter((r) => !r.helpful && r.reason).reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.reason!]: (acc[r.reason!] ?? 0) + r.votes }), {}),
  ).sort((a, b) => b[1] - a[1])
  return (
    <Section title="Was this helpful?" description={postId ? "Votes on this post, all time." : "Votes across every post, all time."}>
      {query.isLoading ? (
        <p className="py-4 text-sm text-muted-foreground">Loading votes.</p>
      ) : yes + no === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">No votes yet.</p>
      ) : (
        <div className="space-y-4">
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {formatPercent(yes / (yes + no))} <span className="text-sm font-normal text-muted-foreground">found it helpful, {formatCount(yes + no)} votes</span>
          </p>
          {reasons.length ? (
            <BarList rows={reasons.map(([value, n]) => ({ value, visitors: n, views: n }))} label={(v) => REASONS[v] ?? v} noun="votes" />
          ) : null}
        </div>
      )}
    </Section>
  )
}
