"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

/** The Copy button on a code block. */
export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 2000)
        } catch {
          /* clipboard blocked: nothing to do */
        }
      }}
    >
      {done ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      <span aria-live="polite">{done ? "Copied" : "Copy"}</span>
    </button>
  )
}
