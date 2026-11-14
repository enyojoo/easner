"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { EditorSelect } from "@/components/editor/editor-select"
import { formatInZone, validateSchedule, zoneOptions, zonedToUtc } from "@/lib/blog/schedule"

export type ScheduleDraft = { local: string; zone: string }

/** Date and time in a named zone (default: the browser's), with what it means in UTC and for readers. */
export function SchedulePicker({
  value,
  onChange,
  now,
}: {
  value: ScheduleDraft
  onChange: (next: ScheduleDraft) => void
  now: Date
}) {
  const at = useMemo(() => zonedToUtc(value.local, value.zone), [value.local, value.zone])
  const problem = value.local ? validateSchedule(at, now) : null
  const zones = useMemo(() => zoneOptions(value.zone), [value.zone])
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-card p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Date and time
          <Input
            type="datetime-local"
            aria-label="Publish date and time"
            aria-invalid={problem ? true : undefined}
            className="h-10"
            value={value.local}
            onChange={(event) => onChange({ ...value, local: event.target.value })}
          />
        </label>
        <div className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          <span id="schedule-zone-label">Time zone</span>
          <EditorSelect
            ariaLabel="Time zone"
            value={value.zone}
            onValueChange={(zone) => onChange({ ...value, zone })}
            options={zones.map((zone) => ({ value: zone, label: zone.replace(/_/g, " ") }))}
          />
        </div>
      </div>
      {problem ? (
        <p role="alert" className="text-xs text-destructive-text">
          {problem}
        </p>
      ) : at ? (
        <p className="text-xs leading-5 text-muted-foreground">
          Goes live <span className="font-medium text-foreground">{formatInZone(at, value.zone)}</span>
          {value.zone === "UTC" ? "" : `, which is ${formatInZone(at, "UTC")}`}. It publishes within 5 minutes of that time.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Pick when it should go live.</p>
      )}
    </div>
  )
}
