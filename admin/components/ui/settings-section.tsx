import * as React from "react"

import { ActorLine } from "@/components/ui/actor-line"
import type { OfficeActor } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SettingsSectionProps = {
  title: string
  /** One line: what the setting changes and for whom. */
  description?: React.ReactNode
  children: React.ReactNode
  /** The save action(s), right-aligned in the footer. A change that needs approval says so on the button. */
  action?: React.ReactNode
  /** Audit line: "Changed by Ada Mensah • Sep 24, 2026 • 2:14 PM". */
  changedBy?: React.ReactNode
  /**
   * The last change as data: renders "Changed by <name> • <date>" with the exact time in a tooltip,
   * or "Last changed <date>" when no actor was recorded. Used in place of `changedBy` when present.
   */
  lastChange?: { at: string | null | undefined; actor?: OfficeActor | null } | null
  className?: string
}

/** A settings-like card: title, what it changes, the controls, and a footer with the save action and last-changed line. */
export function SettingsSection({ title, description, children, action, changedBy, lastChange, className }: SettingsSectionProps) {
  const audit = lastChange?.at ? <ActorLine at={lastChange.at} actor={lastChange.actor} /> : changedBy
  return (
    <Card data-slot="settings-section" className={cn("gap-5", className)}>
      <CardHeader>
        <CardTitle className="text-base leading-snug">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
      {action || audit ? (
        <CardFooter className="flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
          <p className="text-xs text-muted-foreground">{audit}</p>
          {action ? <div className="flex items-center gap-2">{action}</div> : null}
        </CardFooter>
      ) : null}
    </Card>
  )
}
