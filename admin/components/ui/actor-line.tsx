"use client"

import * as React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { OfficeActor } from "@/lib/types"
import { cn } from "@/lib/utils"

const DATE_PART = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
const TIME_PART = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })
const EXACT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
})

function toDate(at: string | null | undefined): Date | null {
  if (!at) return null
  const date = new Date(at)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "Sep 24, 2026 • 2:14 PM", or null for a missing or unusable value. */
export function formatActorTime(at: string | null | undefined): string | null {
  const date = toDate(at)
  return date ? `${DATE_PART.format(date)} • ${TIME_PART.format(date)}` : null
}

type ActorLineProps = {
  /** When it changed. Nothing renders without it. */
  at: string | null | undefined
  /** Who changed it. Without one the line is the date only. */
  actor?: OfficeActor | null
  /** Past-tense verb: "Changed" (default), "Restricted", "Approved". Reads "<verb> by <name> • <date>". */
  verb?: string
  /** Show only "<name> • <date>" (for a row that already says what happened). */
  bare?: boolean
  className?: string
}

/**
 * "Changed by Ada Mensah • Sep 24, 2026 • 2:14 PM", with the exact time (seconds and time zone) in a
 * tooltip. No actor: "Last changed Sep 24, 2026 • 2:14 PM". The staff id is never shown.
 */
export function ActorLine({ at, actor, verb = "Changed", bare = false, className }: ActorLineProps) {
  const date = toDate(at)
  const when = formatActorTime(at)
  if (!date || !when) return null
  const name = actor?.name?.trim()
  const text = bare
    ? name
      ? `${name} • ${when}`
      : when
    : name
      ? `${verb} by ${name} • ${when}`
      : `Last ${verb.toLowerCase()} ${when}`
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <time
            dateTime={date.toISOString()}
            tabIndex={0}
            data-slot="actor-line"
            // Local clock vs UTC server render; exact stamp stays in the tooltip.
            suppressHydrationWarning
            className={cn(
              "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          >
            {text}
          </time>
        </TooltipTrigger>
        <TooltipContent>{EXACT.format(date)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * "By Ada Mensah" for a timeline row that already shows when. The exact time is in the tooltip.
 * Renders nothing when no actor was recorded, so the row falls back to its own text.
 */
export function ActorName({ at, actor, className }: { at: string | null | undefined; actor?: OfficeActor | null; className?: string }) {
  const name = actor?.name?.trim()
  const date = toDate(at)
  if (!name) return null
  if (!date) return <span className={className}>By {name}</span>
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className={cn("rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
          >
            By {name}
          </span>
        </TooltipTrigger>
        <TooltipContent>{EXACT.format(date)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
