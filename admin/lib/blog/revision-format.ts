/** Wording for History rows. Pure, tested. */
import type { RevisionKind } from "../../components/editor/types.ts"

export const KIND_LABEL: Record<RevisionKind, string> = {
  autosave: "Autosave",
  submit: "Submitted for review",
  publish: "Published",
  restore: "Restored a version",
}

/** Milestones are the rows people look for: everything but the autosaves. */
export const isMilestone = (kind: RevisionKind) => kind !== "autosave"

/** "+42 words", "−8 words", "No word change". `before` is the next older version, null for the first. */
export function wordDelta(words: number | null, before: number | null): string {
  if (words === null) return ""
  if (before === null) return `${words} ${words === 1 ? "word" : "words"}`
  const delta = words - before
  if (delta === 0) return "No word change"
  const abs = Math.abs(delta)
  return `${delta > 0 ? "+" : "−"}${abs} ${abs === 1 ? "word" : "words"}`
}

/** "Today, 14:32", "Yesterday, 09:05", "12 Nov, 09:05", "12 Nov 2025". Local time of the viewer. */
export function whenLabel(iso: string, now: Date = new Date()): string {
  const at = new Date(iso)
  const time = at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((day(now) - day(at)) / 86_400_000)
  if (diff === 0) return `Today, ${time}`
  if (diff === 1) return `Yesterday, ${time}`
  const date = at.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(at.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }) })
  return at.getFullYear() === now.getFullYear() ? `${date}, ${time}` : date
}
