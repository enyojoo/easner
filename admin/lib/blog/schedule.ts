/**
 * Scheduling helpers: a wall-clock time in a named time zone to a UTC instant and back, without a date library.
 * The database stores UTC (`scheduled_for`); the dialog shows the zone it was typed in. Pure, tested.
 */

/** Offset (ms) of `zone` from UTC at the instant `at`: positive east of Greenwich. */
export function zoneOffsetMs(zone: string, at: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(at))
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
  return asUtc - Math.floor(at / 1000) * 1000
}

const LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

/**
 * "2026-12-01T09:30" typed in `zone` to the UTC instant. A time skipped by a clock change (spring forward) moves
 * forward by the gap; an ambiguous one (fall back) takes the first. Returns null for anything that isn't a date.
 */
export function zonedToUtc(local: string, zone: string): Date | null {
  const match = LOCAL.exec(local)
  if (!match) return null
  const [, y, mo, d, h, mi] = match.map(Number) as number[]
  const guess = Date.UTC(y, mo - 1, d, h, mi)
  const check = new Date(guess)
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null
  try {
    // The offsets a day before and after bracket any clock change; try both.
    const candidates = [...new Set([guess - zoneOffsetMs(zone, guess - 86_400_000), guess - zoneOffsetMs(zone, guess + 86_400_000)])]
    // Two valid candidates: the hour repeats, take the first. None: it was skipped, move forward past the gap.
    const valid = candidates.filter((candidate) => utcToZoned(new Date(candidate), zone) === local)
    return new Date(valid.length ? Math.min(...valid) : Math.max(...candidates))
  } catch {
    return null
  }
}

/** A UTC instant as "YYYY-MM-DDTHH:mm" on the wall clock of `zone` (what a datetime-local input takes). */
export function utcToZoned(at: Date | string, zone: string): string {
  const ms = typeof at === "string" ? Date.parse(at) : at.getTime()
  const shifted = new Date(ms + zoneOffsetMs(zone, ms))
  return shifted.toISOString().slice(0, 16)
}

/** "Tue 1 Dec 2026, 09:30 GMT+1": the time with its zone, for people. */
export function formatInZone(at: Date | string, zone: string, locale = "en-GB"): string {
  const date = typeof at === "string" ? new Date(at) : at
  const text = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(date)
  return text.replace(/,? (\d{2}:\d{2})/, ", $1")
}

export const MIN_LEAD_MINUTES = 5

/** Null when `at` can be scheduled. The cron runs every 5 minutes, so a post needs a little lead time. */
export function validateSchedule(at: Date | null, now: Date): string | null {
  if (!at) return "Enter a date and a time."
  if (at.getTime() < now.getTime() + MIN_LEAD_MINUTES * 60_000) return `Choose a time at least ${MIN_LEAD_MINUTES} minutes from now.`
  return null
}

export function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

/** The browser's zone first, then the common ones, then every zone the browser knows. */
export function zoneOptions(current: string): string[] {
  const common = ["UTC", "Africa/Lagos", "Africa/Nairobi", "Africa/Johannesburg", "Europe/London", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Los_Angeles", "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore"]
  let all: string[] = []
  try {
    all = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ?? []
  } catch {
    all = []
  }
  return [...new Set([current, ...common, ...all])]
}

/** A scheduled time as a line for the status area: "Goes live Tue 1 Dec 2026, 09:30 GMT+1". */
export const scheduledLine = (iso: string, zone: string) => `Goes live ${formatInZone(iso, zone)}`
