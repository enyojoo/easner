import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  description?: React.ReactNode
  /** Right-aligned actions: `sm` buttons, one primary at most. */
  actions?: React.ReactNode
  /** Detail pages: a back circle linking here. */
  backHref?: string
  /** Flows: a back circle that calls this (e.g. router.back()). Ignored when `backHref` is set. */
  onBack?: () => void
  /** Accessible name of the back circle ("Back to transactions"). */
  backLabel?: string
  className?: string
}

const backCircleClass =
  "mt-0 inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-border text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * The title row every Office page opens with: optional back circle, an h1 (24 semibold),
 * one line of description and the page's actions.
 */
export function PageHeader({ title, description, actions, backHref, onBack, backLabel, className }: PageHeaderProps) {
  const back = backHref ? (
    <Link href={backHref} aria-label={backLabel ?? "Back"} className={backCircleClass}>
      <ArrowLeft className="size-5" aria-hidden />
    </Link>
  ) : onBack ? (
    <button type="button" aria-label={backLabel ?? "Back"} onClick={onBack} className={backCircleClass}>
      <ArrowLeft className="size-5" aria-hidden />
    </button>
  ) : null

  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {back}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
