"use client"

import { useEffect } from "react"

const RETRY_KEY = "chunk-load-retry"

function isChunkLoadError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.name === "ChunkLoadError" || err.message?.includes("Loading chunk"))
  )
}

function tryReload() {
  const hasRetried = sessionStorage.getItem(RETRY_KEY) === "1"
  if (hasRetried) {
    sessionStorage.removeItem(RETRY_KEY)
    return
  }
  sessionStorage.setItem(RETRY_KEY, "1")
  window.location.reload()
}

/**
 * Handles ChunkLoadError by auto-reloading once.
 * Common when dev server restarts or chunks are stale.
 */
export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error)) tryReload()
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        event.preventDefault()
        tryReload()
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)
    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return null
}
