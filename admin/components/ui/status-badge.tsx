import * as React from "react"
import { AlertCircle, CheckCircle2, Clock, Lock, Undo2, XCircle, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  getStatusPresentation,
  STATUS_BADGE_TONE_CLASS,
  STATUS_TEXT_TONE_CLASS,
  type StatusIconName,
} from "@/lib/status"

export { STATUS_BADGE_TONE_CLASS, STATUS_TEXT_TONE_CLASS }

/**
 * StatusBadge from the design system, copied from Office. Tone and label come from the admin's own status table
 * (`lib/status.ts`: Draft, In review, Scheduled, Published, Changes not published, Archived …). Blue is never a status.
 */

export type StatusBadgeProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Status key: `draft`, `in_review`, `published`, `archived`, … */
  status: string | null | undefined
  /** Overrides the label; the tone still comes from `status`. */
  children?: React.ReactNode
  /** Same as Expo StatusPill; default true. */
  showIcon?: boolean
}

const STATUS_ICONS: Record<StatusIconName, LucideIcon> = {
  "check-circle": CheckCircle2,
  clock: Clock,
  "x-circle": XCircle,
  "alert-circle": AlertCircle,
  undo: Undo2,
  lock: Lock,
}

export function StatusBadge({ status, children, showIcon = true, className, ...props }: StatusBadgeProps) {
  const { label, tone, icon } = getStatusPresentation(status)
  const iconName = showIcon ? icon : null
  const Icon = iconName ? STATUS_ICONS[iconName] : null
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap",
        "rounded-full border border-transparent px-3 py-1 text-xs font-medium",
        "[&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0",
        STATUS_BADGE_TONE_CLASS[tone],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon strokeWidth={2.25} aria-hidden /> : null}
      {children ?? label}
    </span>
  )
}
