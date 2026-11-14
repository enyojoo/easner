"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

type CopyFieldProps = {
  label: string
  value: string | null | undefined
  /** Mono for numbers, IDs and addresses. */
  mono?: boolean
  /** Compact inline chip (case headers) instead of the labelled 48px box. */
  inline?: boolean
  className?: string
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** A value people copy into another app. The box is the button: "Copy {label}". */
export function CopyField({ label, value, mono = true, inline = false, className }: CopyFieldProps) {
  const [copied, setCopied] = React.useState(false)
  const raw = value?.trim() ?? ""

  const copy = async () => {
    if (!raw) return
    if (await copyText(raw)) {
      setCopied(true)
      toast.success("Copied")
      window.setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Couldn’t copy. Try again.")
    }
  }

  const Icon = copied ? Check : Copy
  const ring =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  if (inline) {
    return (
      <button
        type="button"
        onClick={() => void copy()}
        disabled={!raw}
        aria-label={`Copy ${label.toLowerCase()}`}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-lg px-1.5 py-0.5 text-xs transition-colors disabled:pointer-events-none",
          copied
            ? "bg-success-surface text-success-text"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
          mono && "font-mono",
          ring,
          className,
        )}
      >
        <span className="truncate">{raw || "–"}</span>
        {raw ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
        <span className="sr-only" aria-live="polite">
          {copied ? "Copied" : ""}
        </span>
      </button>
    )
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => void copy()}
        disabled={!raw}
        aria-label={`Copy ${label.toLowerCase()}`}
        className={cn(
          "flex min-h-12 w-full items-center justify-between gap-3 rounded-md bg-muted/70 px-3.5 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted",
          mono && "font-mono",
          ring,
        )}
      >
        <span className="min-w-0 break-all">{raw || "–"}</span>
        {raw ? (
          <Icon
            className={cn("size-4 shrink-0", copied ? "text-success-text" : "text-muted-foreground")}
            aria-hidden
          />
        ) : null}
        <span className="sr-only" aria-live="polite">
          {copied ? "Copied" : ""}
        </span>
      </button>
    </div>
  )
}
