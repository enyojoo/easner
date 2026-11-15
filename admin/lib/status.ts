/**
 * The admin's status table (StatusBadge). Same tones as Office: green done, amber waiting, red failed, neutral idle.
 * Blue is never a status.
 */
export type StatusTone = "success" | "warning" | "destructive" | "neutral"
export type StatusIconName = "check-circle" | "clock" | "x-circle" | "alert-circle" | "undo" | "lock"

type Presentation = { label: string; tone: StatusTone; icon: StatusIconName | null }

const TABLE: Record<string, Presentation> = {
  // Posts
  draft: { label: "Draft", tone: "neutral", icon: null },
  in_review: { label: "In review", tone: "warning", icon: "clock" },
  changes_requested: { label: "Changes requested", tone: "warning", icon: "alert-circle" },
  scheduled: { label: "Scheduled", tone: "neutral", icon: "clock" },
  published: { label: "Published", tone: "success", icon: "check-circle" },
  changes_not_published: { label: "Changes not published", tone: "warning", icon: "alert-circle" },
  archived: { label: "Archived", tone: "neutral", icon: "lock" },
  // Team
  active: { label: "Active", tone: "success", icon: "check-circle" },
  invited: { label: "Invited", tone: "warning", icon: "clock" },
}

export function getStatusPresentation(status: string | null | undefined): Presentation {
  const key = (status ?? "").toLowerCase()
  return (
    TABLE[key] ?? {
      label: key ? key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ") : "–",
      tone: "neutral",
      icon: null,
    }
  )
}

/** Soft pill fill + readable text per tone. */
export const STATUS_BADGE_TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-success-surface text-success-text",
  warning: "bg-warning-surface text-warning-text",
  destructive: "bg-destructive-surface text-destructive-text",
  neutral: "bg-muted text-muted-foreground",
}

/** Status word in a row (no pill): the text colour per tone. */
export const STATUS_TEXT_TONE_CLASS: Record<StatusTone, string> = {
  success: "text-success-text",
  warning: "text-warning-text",
  destructive: "text-destructive-text",
  neutral: "text-muted-foreground",
}
