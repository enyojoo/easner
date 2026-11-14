export type AutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "offline" | "error"
export interface AutosaveState {
  status: AutosaveStatus
  savedAt: number | null
  /** An edit arrived while a save was in flight. */
  pending: boolean
  error: string | null
  online: boolean
}
export type AutosaveEvent =
  | { type: "edit" }
  | { type: "save-start" }
  | { type: "save-ok"; at: number }
  | { type: "save-fail"; message: string; offline: boolean }
  | { type: "online" }
  | { type: "offline" }

export const initialAutosave: AutosaveState = { status: "idle", savedAt: null, pending: false, error: null, online: true }

export function autosaveReducer(state: AutosaveState, event: AutosaveEvent): AutosaveState {
  switch (event.type) {
    case "edit":
      if (state.status === "saving") return { ...state, pending: true }
      return { ...state, status: state.online ? "dirty" : "offline", error: null }
    case "save-start":
      return { ...state, status: "saving", pending: false }
    case "save-ok":
      return state.pending
        ? { ...state, status: "dirty", savedAt: event.at, pending: false, error: null }
        : { ...state, status: "saved", savedAt: event.at, error: null }
    case "save-fail":
      return { ...state, status: event.offline ? "offline" : "error", online: event.offline ? false : state.online, error: event.message, pending: false }
    case "offline":
      return { ...state, online: false, status: state.status === "idle" || state.status === "saved" ? state.status : "offline" }
    case "online":
      // Back online with unsaved work: dirty again, so the editor saves it.
      return { ...state, online: true, status: state.status === "offline" || state.status === "error" ? "dirty" : state.status }
  }
}

export function savedLabel(state: AutosaveState, now: number): string {
  if (state.status === "saving") return "Saving…"
  if (state.status === "offline") return "Offline, changes kept on this device"
  if (state.status === "error") return "Couldn’t save. Retrying…"
  if (state.savedAt == null) return state.status === "dirty" ? "Unsaved changes" : ""
  const s = Math.max(0, Math.floor((now - state.savedAt) / 1000))
  if (s < 3) return "Saved just now"
  if (s < 60) return `Saved ${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `Saved ${m} min ago`
  const h = Math.floor(m / 60)
  return `Saved ${h} h ago`
}

const BACKOFF = [2000, 5000, 15000, 30000]
/** Retry delay in ms for the nth failed attempt (0-based): 2s, 5s, 15s, then 30s. */
export function nextDelay(attempt: number): number {
  return BACKOFF[Math.min(Math.max(0, attempt), BACKOFF.length - 1)]
}

/** A local backup wins when it was written after the server copy last changed (and was based on that copy or later). */
export function isNewerBackup(
  backup: { savedAt: number; baseUpdatedAt: string | null },
  server: { updatedAt: string },
): boolean {
  const serverAt = Date.parse(server.updatedAt)
  if (Number.isNaN(serverAt)) return true
  return backup.savedAt > serverAt
}
