"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { del, get, set } from "idb-keyval"
import { autosaveReducer, initialAutosave, isNewerBackup, nextDelay, savedLabel, type AutosaveState } from "@/lib/blog/autosave"
import type { DraftSnapshot } from "@/components/editor/types"

export const AUTOSAVE_DEBOUNCE_MS = 2000

type Backup = DraftSnapshot & { savedAt: number; baseUpdatedAt: string | null }

const backupKey = (postId: string) => `easner-admin:post-backup:${postId}`

async function readBackup(postId: string): Promise<Backup | null> {
  try {
    return (await get<Backup>(backupKey(postId))) ?? null
  } catch {
    return null
  }
}
async function writeBackup(postId: string, backup: Backup) {
  try {
    await set(backupKey(postId), backup)
  } catch {
    // Private windows can refuse IndexedDB; autosave to the server still works.
  }
}
async function clearBackup(postId: string) {
  try {
    await del(backupKey(postId))
  } catch {
    // Same.
  }
}

/**
 * Debounced autosave with an IndexedDB safety copy. `markDirty(snapshot)` on every edit; the save runs after ~2s of
 * quiet, retries with a backoff when it fails, and waits for the network when offline. The backup is written on every
 * edit and removed once the server has the same snapshot.
 */
export function useAutosave({
  postId,
  enabled,
  save,
  baseUpdatedAt,
  onSaved,
}: {
  postId: string
  enabled: boolean
  save: (snapshot: DraftSnapshot) => Promise<{ updatedAt: string }>
  baseUpdatedAt: string | null
  onSaved?: (updatedAt: string) => void
}) {
  const [state, dispatch] = useReducer(autosaveReducer, initialAutosave)
  const [now, setNow] = useState(() => Date.now())
  const snapshot = useRef<DraftSnapshot | null>(null)
  const sent = useRef<DraftSnapshot | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saving = useRef(false)
  const attempts = useRef(0)
  const baseRef = useRef(baseUpdatedAt)
  const saveRef = useRef(save)
  const onSavedRef = useRef(onSaved)
  const runRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    saveRef.current = save
    onSavedRef.current = onSaved
  })

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const run = useCallback(async () => {
    clearTimer()
    const snap = snapshot.current
    if (!snap || saving.current) return
    saving.current = true
    sent.current = snap
    dispatch({ type: "save-start" })
    try {
      const { updatedAt } = await saveRef.current(snap)
      baseRef.current = updatedAt
      attempts.current = 0
      dispatch({ type: "save-ok", at: Date.now() })
      onSavedRef.current?.(updatedAt)
      if (snapshot.current === snap) {
        snapshot.current = null
        void clearBackup(postId)
      } else {
        timer.current = setTimeout(() => void runRef.current(), AUTOSAVE_DEBOUNCE_MS)
      }
    } catch (error) {
      const offline =
        (typeof navigator !== "undefined" && navigator.onLine === false) ||
        Boolean(error && typeof error === "object" && "offline" in error && (error as { offline?: boolean }).offline)
      const message = error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String((error as { message: unknown }).message) : "Couldn’t save."
      dispatch({ type: "save-fail", message, offline })
      if (!offline) timer.current = setTimeout(() => void runRef.current(), nextDelay(attempts.current))
      attempts.current += 1
    } finally {
      saving.current = false
    }
  }, [postId])
  useEffect(() => {
    runRef.current = run
  }, [run])

  const markDirty = useCallback(
    (next: DraftSnapshot) => {
      if (!enabled) return
      snapshot.current = next
      dispatch({ type: "edit" })
      void writeBackup(postId, { ...next, savedAt: Date.now(), baseUpdatedAt: baseRef.current })
      clearTimer()
      timer.current = setTimeout(() => void run(), AUTOSAVE_DEBOUNCE_MS)
    },
    [enabled, postId, run],
  )

  /** Drops the unsaved snapshot without saving (the lock was taken over). The device backup stays. */
  const discard = useCallback(() => {
    clearTimer()
    snapshot.current = null
  }, [])

  /** Saves now (⌘S, before submit and publish). Resolves when nothing is left to save. */
  const flush = useCallback(async () => {
    for (let i = 0; i < 3 && snapshot.current; i += 1) {
      if (saving.current) await new Promise((resolve) => setTimeout(resolve, 150))
      else await run()
    }
  }, [run])

  // The network comes and goes: pause while offline, save what was kept as soon as it is back.
  useEffect(() => {
    const goOffline = () => dispatch({ type: "offline" })
    const goOnline = () => {
      dispatch({ type: "online" })
      if (snapshot.current) void run()
    }
    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [run])

  // Don't lose work when the tab closes with unsaved edits.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (snapshot.current) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [])

  // The "Saved 4s ago" label ticks.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => () => clearTimer(), [])

  const label = useMemo(() => savedLabel(state, now), [state, now])
  return { state: state as AutosaveState, label, markDirty, flush, discard, readBackup: () => readBackup(postId), clearBackup: () => clearBackup(postId), isNewerBackup }
}
