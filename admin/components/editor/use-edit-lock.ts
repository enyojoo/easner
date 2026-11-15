"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { EditorAdapter, LockClaim, PresenceViewer } from "@/components/editor/types"

export const LOCK_HEARTBEAT_MS = 30_000

export type LockState =
  /** First claim in flight. */
  | "checking"
  /** You hold the lock: the canvas is editable. */
  | "mine"
  /** Someone else holds it. */
  | "busy"
  /** You held it and someone took it over. Your last changes are kept on this device. */
  | "lost"
  /** Locks don't apply: the role can't edit this post (or the post is read-only anyway). */
  | "off"

export interface EditLock {
  state: LockState
  holder: { id: string | null; name: string | null } | null
  canTakeOver: boolean
  viewers: PresenceViewer[]
  /** Nobody holds the lock any more (the holder left or timed out): editing can start. */
  free: boolean
  takeOver: () => Promise<void>
  start: () => Promise<void>
}

/**
 * The soft lock and presence of a post, by polling (no Realtime): claim and refresh the lock every ~30 seconds while
 * editing, show who is on the post, and let an Editor take over. A lock nobody refreshed for 2 minutes is free
 * (the database decides). `canEdit` is whether the role may edit this post at all.
 */
export function useEditLock({
  adapter,
  postId,
  canEdit,
  onLost,
  onTakenOver,
}: {
  adapter: EditorAdapter
  postId: string
  canEdit: boolean
  onLost?: () => void
  onTakenOver?: () => void
}): EditLock {
  const [state, setState] = useState<LockState>(canEdit ? "checking" : "off")
  const [holder, setHolder] = useState<EditLock["holder"]>(null)
  const [canTakeOver, setCanTakeOver] = useState(false)
  const [viewers, setViewers] = useState<PresenceViewer[]>([])
  const stateRef = useRef(state)
  const onLostRef = useRef(onLost)
  const onTakenOverRef = useRef(onTakenOver)
  useEffect(() => {
    stateRef.current = state
    onLostRef.current = onLost
    onTakenOverRef.current = onTakenOver
  })

  const apply = useCallback((claim: LockClaim) => {
    setCanTakeOver(claim.can_take_over)
    setHolder({ id: claim.holder_id, name: claim.holder_name })
    if (claim.acquired) setState("mine")
    else {
      if (stateRef.current === "mine") onLostRef.current?.()
      setState(stateRef.current === "mine" ? "lost" : "busy")
    }
  }, [])

  const refreshViewers = useCallback(async () => {
    try {
      setViewers(await adapter.viewers(postId))
    } catch {
      // Presence is a nicety; a failed poll just keeps the last list.
    }
  }, [adapter, postId])

  // One heartbeat: hold or refresh the lock when editing is allowed, otherwise just say we are here.
  const beat = useCallback(async () => {
    try {
      if (canEdit && stateRef.current !== "lost" && stateRef.current !== "busy") {
        apply(await adapter.claimLock(postId, false))
      } else {
        await adapter.touchPresence(postId)
      }
    } catch {
      // Offline or a blip: keep the current state; the next beat tries again.
    }
    await refreshViewers()
  }, [adapter, apply, canEdit, postId, refreshViewers])

  useEffect(() => {
    if (!canEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the role decides, nothing to wait for
      setState("off")
      void beat()
    } else if (stateRef.current === "off") {
      setState("checking")
    }
    void beat()
    const id = setInterval(() => void beat(), adapter.lockHeartbeatMs ?? LOCK_HEARTBEAT_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when the post or the right to edit changes
  }, [postId, canEdit])

  // Leaving the post frees the lock at once instead of after 2 minutes.
  useEffect(() => {
    const release = () => {
      if (stateRef.current === "mine") void adapter.releaseLock(postId)
    }
    window.addEventListener("pagehide", release)
    return () => {
      window.removeEventListener("pagehide", release)
      release()
    }
  }, [adapter, postId])

  const free = (state === "busy" || state === "lost") && viewers.length > 0 && !viewers.some((viewer) => viewer.holds_lock)

  const takeOver = useCallback(async () => {
    const claim = await adapter.claimLock(postId, true)
    if (claim.acquired) onTakenOverRef.current?.()
    setCanTakeOver(claim.can_take_over)
    setHolder({ id: claim.holder_id, name: claim.holder_name })
    setState(claim.acquired ? "mine" : "busy")
    await refreshViewers()
  }, [adapter, postId, refreshViewers])

  const start = useCallback(async () => {
    const claim = await adapter.claimLock(postId, false)
    setCanTakeOver(claim.can_take_over)
    setHolder({ id: claim.holder_id, name: claim.holder_name })
    if (claim.acquired) onTakenOverRef.current?.()
    setState(claim.acquired ? "mine" : "busy")
    await refreshViewers()
  }, [adapter, postId, refreshViewers])

  return { state, holder, canTakeOver, viewers, free, takeOver, start }
}
