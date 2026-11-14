"use client"

import { Hash } from "lucide-react"

/** The `#` beside an H2/H3. It is a real anchor link; clicking also copies the full link. */
export function HeadingAnchor({ id, label }: { id: string; label: string }) {
  return (
    <a
      className="anc"
      href={`#${id}`}
      aria-label={`Link to “${label}”`}
      onClick={() => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`
        navigator.clipboard?.writeText(url).catch(() => {})
      }}
    >
      <Hash size={18} aria-hidden="true" />
    </a>
  )
}
