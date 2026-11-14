"use client"

import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ChecklistItem, ChecklistResult } from "@/lib/blog/checklist"
import type { ReviewState } from "@/components/editor/types"
import { cn } from "@/lib/utils"

const ICON = {
  pass: { Icon: CheckCircle2, className: "text-success-text" },
  warning: { Icon: AlertTriangle, className: "text-warning-text" },
  error: { Icon: XCircle, className: "text-destructive-text" },
} as const

function Group({ title, items, onAction }: { title: string; items: ChecklistItem[]; onAction: (item: ChecklistItem) => void }) {
  if (!items.length) return null
  return (
    <section aria-label={title} className="grid gap-1.5">
      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
      <ul className="grid gap-1">
        {items.map((item) => {
          const { Icon, className } = ICON[item.severity]
          return (
            <li key={item.id} className="flex items-start gap-3 rounded-md px-1 py-1.5">
              <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.detail ? <p className="text-xs leading-5 text-muted-foreground">{item.detail}</p> : null}
              </div>
              {item.action ? (
                <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={() => onAction(item)}>
                  {item.action.label}
                </Button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/**
 * "Publish this post?": the per-post SEO rules and the brand-voice lint. Red items block, amber items never do.
 * Flagged posts also show where the two-Editor approval stands.
 */
export function PublishDialog({
  open,
  onOpenChange,
  mode,
  result,
  review,
  primaryLabel,
  primaryIsApproval,
  pending,
  onConfirm,
  onItemAction,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "publish" | "update"
  result: ChecklistResult
  review: ReviewState | null
  primaryLabel: string
  /** The main button records an approval and does not publish yet. */
  primaryIsApproval: boolean
  pending: boolean
  onConfirm: () => void
  onItemAction: (item: ChecklistItem) => void
}) {
  const errors = result.items.filter((item) => item.severity === "error")
  const warnings = result.items.filter((item) => item.severity === "warning")
  const passed = result.items.filter((item) => item.severity === "pass")
  const blocked = result.errors > 0 && !primaryIsApproval
  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "update" ? "Update this post?" : "Publish this post?"}</DialogTitle>
          <DialogDescription>
            {mode === "update"
              ? "The live post changes to this version. Readers see it as soon as the website refreshes."
              : "The post goes live on easner.com/blog. Readers see it as soon as the website refreshes."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[55vh] gap-5 overflow-y-auto pr-1">
          {review?.flagged ? (
            <div role="status" className="flex gap-3 rounded-lg bg-warning-surface p-3 text-sm text-warning-text">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="font-medium">A second Editor has to approve this post</p>
                <p className="text-xs leading-5">
                  It makes claims the claims check watches: {review.matches.length ? review.matches.join(", ") : "fees, rates or regulation"}.
                  {review.approvals.length
                    ? ` Approved by ${review.approvals.map((approval) => approval.name || "an Editor").join(", ")}.`
                    : " No approvals yet."}
                </p>
              </div>
            </div>
          ) : null}
          <Group title="To fix" items={errors} onAction={onItemAction} />
          <Group title="To look at" items={warnings} onAction={onItemAction} />
          <Group title="Passed" items={passed} onAction={onItemAction} />
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="outline" disabled title="Scheduling arrives in the next release">
            Schedule
          </Button>
          <Button type="button" variant="primary" disabled={blocked || pending} aria-busy={pending} onClick={onConfirm}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {primaryLabel}
          </Button>
        </DialogFooter>
        {blocked ? (
          <p className="text-right text-xs text-destructive-text">
            {result.errors} {result.errors === 1 ? "thing blocks" : "things block"} publishing.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
