import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  message?: React.ReactNode
  /** One primary for first use, an outline "Clear filters" for no results. */
  actions?: React.ReactNode
  className?: string
}

/**
 * What a list shows when there is nothing in it. Never render it while data is still fetching:
 * keep the last rows (or render nothing) until the query has settled.
 */
export function EmptyState({ icon: Icon, title, message, actions, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}
    >
      {Icon ? (
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-[22px]" aria-hidden />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {message ? <p className="max-w-[380px] text-sm text-muted-foreground">{message}</p> : null}
      {actions ? <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{actions}</div> : null}
    </div>
  )
}
