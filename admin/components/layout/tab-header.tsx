import type * as React from "react"

/** The heading of one Settings tab: what it is, one line about it, and the tab's main action. */
export function TabHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0 space-y-1">
        <h2 className="text-lg font-semibold leading-7 text-foreground">{title}</h2>
        <p className="max-w-2xl text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
