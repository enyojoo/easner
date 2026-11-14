"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { copyText } from "@/components/ui/copy-field"

/** A `dl` of label / value rows: 12 above and below, min 48, a rule between rows and none after the last. */
export function DetailList({ className, ...props }: React.ComponentProps<"dl">) {
  return <dl data-slot="detail-list" className={cn("m-0 flex flex-col", className)} {...props} />
}

type DetailRowProps = {
  label: string
  /** The value. Empty values render an en dash. */
  children?: React.ReactNode
  /** Totals: semibold, foreground. */
  strong?: boolean
  /** IDs and references: monospace. */
  mono?: boolean
  /** Money coming in, in primary-text. */
  tone?: "default" | "positive"
  /**
   * Always-visible copy control for IDs, hashes, addresses and references only.
   * Do not pass emails, phones, names, statuses or other plain labels.
   */
  copyValue?: string | null
  className?: string
}

export function DetailRow({ label, children, strong, mono, tone = "default", copyValue, className }: DetailRowProps) {
  const [copied, setCopied] = React.useState(false)
  const empty = children === null || children === undefined || children === ""
  const copy = async () => {
    if (!copyValue) return
    if (await copyText(copyValue)) {
      setCopied(true)
      toast.success("Copied")
      window.setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <div
      data-slot="detail-row"
      className={cn(
        "flex min-h-12 items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0",
        className,
      )}
    >
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "m-0 flex min-w-0 items-center justify-end gap-1.5 text-right text-sm tabular-nums",
          strong ? "font-semibold text-foreground" : "text-foreground",
          tone === "positive" && "text-primary-text",
          mono && "font-mono text-[13px]",
        )}
      >
        <span
          className={cn(
            "min-w-0",
            // Plain strings may wrap; rich chips (RecipientChip) must not be force-broken.
            typeof children === "string" || typeof children === "number" ? "break-words" : "overflow-hidden",
          )}
        >
          {empty ? "–" : children}
        </span>
        {copyValue ? (
          <button
            type="button"
            onClick={() => void copy()}
            aria-label={`Copy ${label.toLowerCase()}`}
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
              "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              copied && "bg-success-surface text-success-text hover:bg-success-surface hover:text-success-text",
            )}
          >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            <span className="sr-only" aria-live="polite">
              {copied ? "Copied" : ""}
            </span>
          </button>
        ) : null}
      </dd>
    </div>
  )
}
