"use client"

import { niceCeil } from "@/components/analytics/parts"
import { formatCount, formatDay } from "@/lib/analytics/aggregate"
import { axisIndexes, type PublishDot } from "@/lib/analytics/overview"

const W = 1280
const H = 240
const pad = { l: 44, r: 16, t: 12, b: 28 }

/** OffBlogOverview's line chart: this period (chart-1 with a light area), the previous period dashed (chart-5), publish dates as hollow dots. */
export function ViewsChart({ days, views, previous, dots, ariaLabel }: { days: string[]; views: number[]; previous: number[] | null; dots: PublishDot[]; ariaLabel: string }) {
  const n = views.length
  if (n === 0) return null
  const max = niceCeil(Math.max(1, ...views, ...(previous ?? [])))
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const x = (i: number) => pad.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1))
  const y = (v: number) => pad.t + ih - (ih * v) / max
  const path = (values: number[]) => values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")
  const area = `${path(views)} L${x(n - 1).toFixed(1)} ${pad.t + ih} L${pad.l} ${pad.t + ih} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={ariaLabel} className="block h-auto w-full overflow-visible">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih - ih * f} y2={pad.t + ih - ih * f} stroke="var(--chart-grid)" strokeWidth={1} />
          <text x={pad.l - 8} y={pad.t + ih - ih * f + 4} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">{formatCount(Math.round(max * f))}</text>
        </g>
      ))}
      {axisIndexes(n).map((i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">{formatDay(days[i])}</text>
      ))}
      <path d={area} fill="color-mix(in srgb, var(--chart-1) 10%, transparent)" />
      {previous ? <path d={path(previous)} fill="none" stroke="var(--chart-5)" strokeWidth={2} strokeLinejoin="round" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" /> : null}
      <path d={path(views)} fill="none" stroke="var(--chart-1)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {dots.map((dot) => {
        const cx = x(dot.index)
        const right = cx > W * 0.7
        const label = dot.title.length > 34 ? `${dot.title.slice(0, 33)}…` : dot.title
        return (
          <g key={`${dot.index}-${dot.title}`}>
            <circle cx={cx} cy={y(views[dot.index])} r={5} fill="var(--card)" stroke="var(--chart-1)" strokeWidth={2} />
            <text x={right ? cx - 8 : cx + 8} y={y(views[dot.index]) - 10} textAnchor={right ? "end" : "start"} fontSize={12} fontWeight={500} fill="var(--foreground)">{label}</text>
          </g>
        )
      })}
    </svg>
  )
}
