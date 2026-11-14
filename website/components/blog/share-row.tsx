"use client"

import { Check, Link2, Share2 } from "lucide-react"
import { useEffect, useState } from "react"
import { capturePostShared, type BlogShareNetwork } from "@/lib/marketing/analytics"
import { cn } from "@/lib/utils"

/** Every share link carries `utm_source=<network>&utm_medium=share` so visits from shares can be counted. The canonical never does. */
export function shareUrl(url: string, network: BlogShareNetwork): string {
  const u = new URL(url)
  u.searchParams.set("utm_source", network)
  u.searchParams.set("utm_medium", "share")
  return u.toString()
}

const GLYPH = "grid size-[18px] place-items-center rounded-[5px] bg-web-ink text-[10px] font-bold leading-none text-web-canvas"

/**
 * WebPostFeedback share row: Copy link, X, LinkedIn, WhatsApp, plus the native share sheet on phones.
 * `rail` is the vertical stack beside the article on wide screens.
 */
export function ShareRow({ url, title, slug, variant = "row" }: { url: string; title: string; slug: string; variant?: "row" | "rail" }) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  // The share sheet exists only in the browser, so it is detected after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), [])

  const track = (network: BlogShareNetwork) => capturePostShared(slug, network)
  const copy = async () => {
    track("copy")
    try {
      await navigator.clipboard.writeText(shareUrl(url, "copy"))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked */
    }
  }
  const links = [
    { network: "x" as const, label: "X", glyph: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl(url, "x"))}` },
    { network: "linkedin" as const, label: "LinkedIn", glyph: "in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl(url, "linkedin"))}` },
    { network: "whatsapp" as const, label: "WhatsApp", glyph: "W", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl(url, "whatsapp")}`)}` },
  ]

  const rail = variant === "rail"
  return (
    <div className={cn(rail ? "grid gap-3" : "bp-share")}>
      <span className={rail ? "text-xs font-medium tracking-[0.02em] text-web-meta" : "lab"}>Share</span>
      <button type="button" onClick={copy} className={cn("bp-sb", rail && "justify-start", copied && "done")}>
        {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </button>
      {links.map((link) => (
        <a
          key={link.network}
          className={cn("bp-sb", rail && "justify-start")}
          href={link.href}
          target="_blank"
          rel="noopener"
          onClick={() => track(link.network)}
        >
          <span className={GLYPH} aria-hidden="true">{link.glyph}</span>
          {link.label}
        </a>
      ))}
      {canNativeShare && !rail && (
        <button
          type="button"
          className="bp-sb sm:hidden"
          onClick={async () => {
            track("native")
            try {
              await navigator.share({ title, url: shareUrl(url, "native") })
            } catch {
              /* dismissed */
            }
          }}
        >
          <Share2 size={16} aria-hidden="true" />
          Share
        </button>
      )}
    </div>
  )
}
