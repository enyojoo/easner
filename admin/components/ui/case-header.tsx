import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"

type CaseHeaderProps = {
  /** Name of the user, business or transaction. */
  title: string
  /** StatusBadge(s) and restriction state. */
  badges?: React.ReactNode
  /** Copyable IDs (CopyField with `inline`) and one-line meta. */
  meta?: React.ReactNode
  /** Primary actions on the right. Put secondary actions in a DropdownMenu inside. */
  actions?: React.ReactNode
  backHref?: string
  backLabel?: string
  /** Sticky under the shell header (default). */
  sticky?: boolean
  className?: string
}

/**
 * The sticky head of a case page (user, business, transaction): name, status badges, copyable IDs
 * and the primary actions. Tabs go directly under it.
 */
export function CaseHeader({ title, badges, meta, actions, backHref, backLabel, sticky = true, className }: CaseHeaderProps) {
  return (
    <header
      data-slot="case-header"
      className={cn(
        "z-20 -mx-8 flex flex-wrap items-start justify-between gap-4 border-b border-border/60 bg-background/90 px-8 py-4 backdrop-blur",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={backLabel ?? "Back"}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-border text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        ) : null}
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 truncate text-2xl font-semibold tracking-[-0.015em] text-foreground">{title}</h1>
            {badges}
          </div>
          {meta ? <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">{meta}</div> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
