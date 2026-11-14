"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { change, formatCount, formatDay, type Counted } from "@/lib/analytics/aggregate"
import { cn } from "@/lib/utils"

/** A card with a title, one line under it, and room for a table or a list. */
export function Section({ title, description, actions, children, className }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("gap-4 px-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </Card>
  )
}

export function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-base font-semibold text-foreground">
      {children}
    </h2>
  )
}

/** Up is green, down is muted, never red (OffSiteAnalytics). Both come with an arrow, so colour is not the only signal. */
export function Delta({ current, previous, invert = false }: { current: number | null; previous: number | null; invert?: boolean }) {
  const value = change(current, previous)
  if (value === null) return <span className="text-xs text-muted-foreground">No previous data</span>
  if (Math.abs(value) < 0.005) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground tabular-nums">
        <Minus className="size-3" aria-hidden />
        No change
      </span>
    )
  }
  const up = value > 0
  const good = invert ? !up : up
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium tabular-nums", good ? "text-success-text" : "text-muted-foreground")}>
      <Icon className="size-3" aria-hidden />
      {up ? "Up" : "Down"} {Math.abs(value * 100).toFixed(Math.abs(value) < 0.1 ? 1 : 0)}%<span className="sr-only"> from the previous period</span>
    </span>
  )
}

export function Kpi({ label, value, current, previous, hint, loading }: { label: string; value: string; current?: number | null; previous?: number | null; hint?: string; loading?: boolean }) {
  return (
    <Card className="min-w-0 gap-1.5 px-5 py-5">
      <p className="truncate text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
        </>
      ) : (
        <>
          <p className="truncate text-2xl font-semibold tabular-nums text-foreground">{value}</p>
          {current !== undefined && previous !== undefined ? <Delta current={current} previous={previous} /> : hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </>
      )}
    </Card>
  )
}

/** Ranked rows with a share bar. `label` turns a raw value ("NG") into what people read ("Nigeria"). */
export function BarList({
  rows, label, metric = "visitors", empty = "Nothing here yet.", loading, limit = 8, noun = "visitors", valueFormat, showShare = true, maxValue,
}: {
  rows: Counted[] | undefined
  label?: (value: string) => string
  metric?: "visitors" | "views"
  empty?: string
  loading?: boolean
  limit?: number
  noun?: string
  valueFormat?: (value: number) => string
  showShare?: boolean
  /** Bar scale; defaults to the largest row. Use 100 for percentages. */
  maxValue?: number
}) {
  if (loading || !rows) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    )
  }
  if (rows.length === 0) return <p className="py-4 text-sm text-muted-foreground">{empty}</p>
  const shown = rows.slice(0, limit)
  const total = rows.reduce((sum, r) => sum + r[metric], 0)
  const max = maxValue ?? Math.max(...shown.map((r) => r[metric]), 1)
  return (
    <ul className="space-y-2.5">
      {shown.map((row) => (
        <li key={row.value} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1">
          <span className="truncate text-sm text-foreground" title={label ? label(row.value) : row.value}>
            {label ? label(row.value) : row.value}
          </span>
          <span className="text-sm tabular-nums text-foreground">
            {valueFormat ? valueFormat(row[metric]) : formatCount(row[metric])}{" "}
            {showShare ? <span className="text-xs text-muted-foreground">{total > 0 ? `${Math.round((row[metric] / total) * 100)}%` : ""}</span> : null}
            <span className="sr-only"> {noun}</span>
          </span>
          <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <span className="block h-full rounded-full bg-chart-1" style={{ width: `${Math.max(2, (row[metric] / max) * 100)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  )
}

export interface ChartPoint {
  date: string
  visitors: number
  views: number
}

/** Two lines (visitors, views) and an optional dashed previous-period visitors line, in plain SVG with chart tokens. */
export function TrafficChart({ points, previous, labels = { a: "Visitors", b: "Page views" }, compact = false }: { points: ChartPoint[]; previous?: ChartPoint[]; labels?: { a: string; b: string }; compact?: boolean }) {
  const W = compact ? 340 : 880
  const H = compact ? 200 : 240
  const pad = { l: 44, r: 12, t: 12, b: 28 }
  if (points.length === 0) return null
  const max = Math.max(1, ...points.map((p) => Math.max(p.visitors, p.views)), ...(previous ?? []).map((p) => p.visitors))
  const top = niceCeil(max)
  const x = (i: number) => pad.l + (points.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (points.length - 1)) * (W - pad.l - pad.r))
  const y = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b)
  const line = (values: number[]) => values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f))
  const xLabels = points.length < 2 ? [0] : (compact ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]).map((f) => Math.round(f * (points.length - 1)))
  const prevValues = previous && previous.length === points.length ? previous.map((p) => p.visitors) : null
  const total = points.reduce((s, p) => s + p.visitors, 0)
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0 w-4 border-t-2 border-chart-1" aria-hidden />{labels.a}</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0 w-4 border-t-2 border-chart-2" aria-hidden />{labels.b}</span>
        {prevValues ? <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0 w-4 border-t-2 border-dashed border-chart-5" aria-hidden />{labels.a}, previous period</span> : null}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${labels.a} and ${labels.b} per day, ${formatDay(points[0].date)} to ${formatDay(points[points.length - 1].date)}. ${labels.a} total ${formatCount(total)}.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">{formatCount(t)}</text>
          </g>
        ))}
        {xLabels.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} fontSize={11} fill="var(--muted-foreground)">{formatDay(points[i].date)}</text>
        ))}
        {prevValues ? <path d={line(prevValues)} fill="none" stroke="var(--chart-5)" strokeWidth={1.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" /> : null}
        <path d={line(points.map((p) => p.views))} fill="none" stroke="var(--chart-2)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={line(points.map((p) => p.visitors))} fill="none" stroke="var(--chart-1)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

function niceCeil(value: number): number {
  const power = 10 ** Math.floor(Math.log10(value))
  const f = value / power
  const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return Math.max(4, step * power)
}
