"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CHANNEL_LABELS } from "@/lib/analytics/classify"
import { countryName } from "@/lib/analytics/aggregate"
import { useBreakdown, usePages } from "@/lib/analytics/hooks"
import type { DateRange } from "@/lib/analytics/source"
import { FILTER_KEYS, activeDimension, hasBreakdowns, nextFilterPatch, readFilters, type FilterKey, type SiteFilters } from "@/lib/analytics/filters"
import { SITE_PATH, type Channel } from "@/lib/analytics/types"

export { activeDimension, hasBreakdowns, nextFilterPatch, readFilters, FILTER_KEYS, type FilterKey, type SiteFilters }

const ALL = "all"
const capital = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

function FilterSelect({ label, allLabel, value, options, onChange }: { label: string; allLabel: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  // A value from a shared link that is not in the list (a quiet country this period) still shows as chosen.
  const shown = value && !options.some((o) => o.value === value) ? [{ value, label: value }, ...options] : options
  return (
    <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)}>
      <SelectTrigger aria-label={label} className="h-9 w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {shown.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function FilterBar({
  range, filters, compare, onFilter, onCompare, showFilters = true,
}: {
  range: DateRange
  filters: SiteFilters
  compare: boolean
  onFilter: (key: FilterKey, value: string) => void
  onCompare: (value: boolean) => void
  showFilters?: boolean
}) {
  const countries = useBreakdown(range, SITE_PATH, "country", showFilters)
  const devices = useBreakdown(range, SITE_PATH, "device", showFilters)
  const sources = useBreakdown(range, SITE_PATH, "source", showFilters)
  const pages = usePages(range)
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showFilters ? (
        <>
          <FilterSelect label="Country" allLabel="All countries" value={filters.country} onChange={(v) => onFilter("country", v)} options={(countries.data ?? []).slice(0, 30).map((r) => ({ value: r.value, label: countryName(r.value) }))} />
          <FilterSelect label="Device" allLabel="All devices" value={filters.device} onChange={(v) => onFilter("device", v)} options={(devices.data ?? []).map((r) => ({ value: r.value, label: capital(r.value) }))} />
          <FilterSelect label="Source" allLabel="All sources" value={filters.source} onChange={(v) => onFilter("source", v)} options={(sources.data ?? []).map((r) => ({ value: r.value, label: CHANNEL_LABELS[r.value as Channel] ?? capital(r.value) }))} />
          <FilterSelect label="Page" allLabel="All pages" value={filters.page} onChange={(v) => onFilter("page", v)} options={(pages.data ?? []).slice(0, 40).map((r) => ({ value: r.path, label: r.path }))} />
        </>
      ) : null}
      <label className="ml-auto flex items-center gap-3 text-[13px] font-medium leading-[18px] text-foreground">
        <Switch checked={compare} onCheckedChange={onCompare} aria-label="Compare with previous period" />
        Compare with previous period
      </label>
    </div>
  )
}
