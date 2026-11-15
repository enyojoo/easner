"use client"

import Link from "next/link"
import { ArrowLeft, Eye, History, Loader2, MessageSquare, MoreHorizontal, PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { PresenceAvatars } from "@/components/editor/presence-avatars"
import type { PresenceViewer } from "@/components/editor/types"
import type { AutosaveState } from "@/lib/blog/autosave"
import { PRIMARY_LABEL, type PrimaryAction, type SecondaryAction } from "@/lib/blog/workflow"
import { cn } from "@/lib/utils"

const SECONDARY_LABEL: Record<SecondaryAction, string> = {
  "request-changes": "Request changes",
  withdraw: "Withdraw from review",
  unpublish: "Unpublish",
  archive: "Archive",
  unarchive: "Restore as draft",
  reschedule: "Change the schedule",
  unschedule: "Unschedule",
}

export type TopBarAction = PrimaryAction | SecondaryAction

/** The slim 56px bar of the editor (OffBlogEditor): back, status, save state, tools, and the main action. */
export function TopBar({
  backHref,
  status,
  save,
  saveLabel,
  commentCount,
  panelOpen,
  statusNote,
  viewers,
  meId,
  primaryLabel,
  onOpenHistory,
  primary,
  secondary,
  busy,
  onAction,
  onTogglePanel,
  onOpenComments,
  onPreview,
}: {
  backHref: string
  status: string
  save: AutosaveState
  saveLabel: string
  commentCount: number
  panelOpen: boolean
  /** Next to the status: "Goes live Tue 1 Dec 2026, 09:30 GMT+1" for a scheduled post. */
  statusNote?: string | null
  viewers: PresenceViewer[]
  meId: string
  primaryLabel?: string
  onOpenHistory: () => void
  primary: PrimaryAction
  secondary: SecondaryAction[]
  busy: boolean
  onAction: (action: TopBarAction) => void
  onTogglePanel: () => void
  onOpenComments: () => void
  onPreview: () => void
}) {
  const offline = save.status === "offline"
  const failed = save.status === "error"
  const requestChanges = secondary.includes("request-changes")
  const menu = secondary.filter((action) => action !== "request-changes")
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={backHref}>
          <ArrowLeft aria-hidden />
          Posts
        </Link>
      </Button>
      <StatusBadge status={status} />
      {statusNote ? <p className="hidden text-sm text-muted-foreground xl:block">{statusNote}</p> : null}
      <p
        role="status"
        aria-live="polite"
        className={cn("flex items-center gap-1.5 text-sm", offline || failed ? "font-medium text-warning-text" : "text-muted-foreground")}
      >
        {save.status === "saving" ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
        {saveLabel}
      </p>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="mr-1">
          <PresenceAvatars viewers={viewers} meId={meId} />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenComments} aria-label={`Comments, ${commentCount} open`}>
          <MessageSquare aria-hidden />
          {commentCount > 0 ? <span className="tabular-nums">{commentCount}</span> : null}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenHistory} aria-label="History" title="History">
          <History aria-hidden />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onTogglePanel} aria-pressed={panelOpen} aria-label="Settings panel (⌘.)" title="Settings panel (⌘.)">
          <PanelRight aria-hidden />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onPreview} title="Open the draft on the website (⌘⇧P)">
          <Eye aria-hidden />
          Preview
        </Button>
        {requestChanges ? (
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onAction("request-changes")}>
            Request changes
          </Button>
        ) : null}
        {menu.length ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" aria-label="More actions">
                <MoreHorizontal aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menu.map((action, index) => (
                <div key={action}>
                  {index > 0 && action === "archive" ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem onSelect={() => onAction(action)}>{SECONDARY_LABEL[action]}</DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {primary ? (
          <Button type="button" variant="primary" size="sm" disabled={busy} aria-busy={busy} onClick={() => onAction(primary)}>
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {primaryLabel ?? PRIMARY_LABEL[primary]}
          </Button>
        ) : null}
      </div>
    </header>
  )
}
