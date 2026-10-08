import { CircleAlert, CircleCheck, CircleX, Clock, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * StatusBadge – one word from the Easner status table, in its colour pair (design system: components/StatusBadge).
 * Completed, Paid and Verified are green; Pending, Processing and In review amber; Failed, Declined and Overdue
 * red; Cancelled, Draft and Refunded neutral. Blue is never a status. Always a word, never colour alone.
 */
type Tone = "success" | "warning" | "destructive" | "slate"

const STATUS: Record<string, [Tone, string]> = {
  completed: ["success", "Completed"],
  settled: ["success", "Settled"],
  paid: ["success", "Paid"],
  verified: ["success", "Verified"],
  active: ["success", "Active"],
  enabled: ["success", "On"],
  pending: ["warning", "Pending"],
  processing: ["warning", "Processing"],
  scheduled: ["warning", "Scheduled"],
  action_required: ["warning", "Action required"],
  in_review: ["warning", "In review"],
  setting_up: ["warning", "Setting up"],
  sent: ["warning", "Sent"],
  unpaid: ["warning", "Unpaid"],
  partially_paid: ["warning", "Partially paid"],
  awaiting_deposit: ["warning", "Awaiting deposit"],
  payout_pending: ["warning", "Payout pending"],
  failed: ["destructive", "Failed"],
  declined: ["destructive", "Declined"],
  overdue: ["destructive", "Overdue"],
  cancelled: ["slate", "Cancelled"],
  expired: ["slate", "Expired"],
  draft: ["slate", "Draft"],
  refunded: ["slate", "Refunded"],
  disabled: ["slate", "Off"],
  unverified: ["slate", "Unverified"],
  not_started: ["slate", "Not started"],
}

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success-surface text-success-text",
  warning: "bg-warning-surface text-warning-text",
  destructive: "bg-destructive-surface text-destructive-text",
  slate: "bg-muted text-muted-foreground",
}

export type StatusKey = keyof typeof STATUS

export function StatusBadge({ status, className }: { status: StatusKey; className?: string }) {
  const [tone, label] = STATUS[status]
  const Icon =
    status === "cancelled"
      ? CircleAlert
      : status === "refunded"
        ? Undo2
        : tone === "success"
          ? CircleCheck
          : tone === "warning"
            ? Clock
            : tone === "destructive"
              ? CircleX
              : null
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-4",
        TONE_CLASS[tone],
        className,
      )}
    >
      {Icon && <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />}
      {label}
    </span>
  )
}

/** Status as coloured text only, as under amounts in the Easner app (`st` in AppHome). */
export function StatusText({ status, className }: { status: StatusKey; className?: string }) {
  const [tone, label] = STATUS[status]
  const colour =
    tone === "success"
      ? "text-success-text"
      : tone === "warning"
        ? "text-warning-text"
        : tone === "destructive"
          ? "text-destructive-text"
          : "text-muted-foreground"
  return <span className={cn("text-[11px] font-semibold leading-[14px]", colour, className)}>{label}</span>
}
