"use client"

import { useState } from "react"
import { Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EditLock } from "@/components/editor/use-edit-lock"
import { cn } from "@/lib/utils"

/**
 * The soft lock, in words: who is editing, and what you can do about it. Reading is always possible; Editors and
 * Owners can take over. After a take over the person who lost the lock is told their last changes stay on their device.
 */
export function LockBanner({ lock, className }: { lock: EditLock; className?: string }) {
  const [dismissed, setDismissed] = useState(false)
  const [pending, setPending] = useState(false)
  const name = lock.holder?.name ?? "Someone"
  const run = async (work: () => Promise<void>) => {
    setPending(true)
    try {
      await work()
    } finally {
      setPending(false)
    }
  }

  if (lock.state === "busy" || lock.state === "lost") {
    if (dismissed && lock.state === "busy" && !lock.free) return null
    const lost = lock.state === "lost"
    return (
      <div role="status" className={cn("flex flex-wrap items-center gap-3 rounded-lg bg-warning-surface px-4 py-3 text-sm text-warning-text", className)}>
        <Lock className="size-4 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1">
          {lock.free ? (
            <>
              <span className="font-medium">Nobody is editing this post now.</span> You can start editing.
            </>
          ) : lost ? (
            <>
              <span className="font-medium">{name} took over editing.</span> This post is read-only for you now. Changes you made since your last save are kept on this device.
            </>
          ) : (
            <>
              <span className="font-medium">{name} is editing this post.</span> You can read it, but not change it until they are done.
            </>
          )}
        </p>
        {lock.free ? (
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void run(lock.start)}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Start editing
          </Button>
        ) : (
          <>
            {!lost ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => setDismissed(true)}>
                Read only
              </Button>
            ) : null}
            {lock.canTakeOver ? (
              <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void run(lock.takeOver)}>
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                Take over
              </Button>
            ) : null}
          </>
        )}
      </div>
    )
  }
  return null
}
