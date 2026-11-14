"use client"

import { ExternalLink, Play } from "lucide-react"
import { useState } from "react"
import type { EmbedProvider } from "@easner/blog-content"

/** The player URL for providers we can embed without a third-party script. Others open in a new tab. */
export function playerUrl(provider: EmbedProvider, url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "")
    if (provider === "youtube") {
      const id = host === "youtu.be" ? u.pathname.slice(1) : (u.searchParams.get("v") ?? u.pathname.split("/").pop())
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : null
    }
    if (provider === "vimeo") {
      const id = u.pathname.split("/").filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1&dnt=1` : null
    }
    if (provider === "loom") {
      const id = u.pathname.split("/").filter(Boolean).pop()
      return id ? `https://www.loom.com/embed/${encodeURIComponent(id)}?autoplay=1` : null
    }
  } catch {
    /* fall through */
  }
  return null
}

const LABEL: Record<EmbedProvider, string> = { youtube: "Video", vimeo: "Video", loom: "Video", x: "Post on X", other: "Link" }

/**
 * Click-to-load embed. Nothing from the provider loads (no script, no cookie, no thumbnail) until the reader presses
 * play, which keeps Core Web Vitals clean and the page free of third-party cookies.
 */
export function EmbedFacade({ provider, url, title }: { provider: EmbedProvider; url: string; title?: string }) {
  const [loaded, setLoaded] = useState(false)
  const src = playerUrl(provider, url)
  const caption = title ?? "Embedded content"

  if (!src) {
    return (
      <div className="bp-embed">
        <a href={url} target="_blank" rel="noopener">
          <span className="pl">
            <ExternalLink size={24} aria-hidden="true" />
          </span>
          <span className="cap">
            <span>{caption}</span>
            <span>{LABEL[provider]} · opens in a new tab</span>
          </span>
        </a>
      </div>
    )
  }
  return (
    <div className="bp-embed">
      {loaded ? (
        <iframe
          src={src}
          title={caption}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" onClick={() => setLoaded(true)} aria-label={`Play: ${caption}`}>
          <span className="pl">
            <Play size={26} aria-hidden="true" />
          </span>
          <span className="cap">
            <span>{caption}</span>
            <span>{LABEL[provider]} · loads when you press play</span>
          </span>
        </button>
      )}
    </div>
  )
}
