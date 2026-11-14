"use client"

import { useEffect, useRef, useState } from "react"
import { captureBlogReadDepth, type BlogReadDepth } from "@/lib/marketing/analytics"

const DEPTHS: BlogReadDepth[] = [25, 50, 75, 100]

/**
 * The 3px reading-progress bar under the header (`role="progressbar"`), and the `blog_read_depth` event (25, 50, 75,
 * 100, each once per page view). Progress is measured across the article element, not the whole page.
 */
export function ReadingProgress({ slug, targetId = "post-article", enabled = true }: { slug: string; targetId?: string; enabled?: boolean }) {
  const [value, setValue] = useState(0)
  const sent = useRef(new Set<number>())

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const el = document.getElementById(targetId)
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight * 0.6
      const read = Math.min(Math.max(-rect.top + window.innerHeight * 0.4, 0), Math.max(total, 1))
      const pct = total > 0 ? Math.round((read / total) * 100) : 100
      setValue(Math.min(100, Math.max(0, pct)))
      if (!enabled) return
      for (const depth of DEPTHS) {
        if (pct >= depth && !sent.current.has(depth)) {
          sent.current.add(depth)
          captureBlogReadDepth(slug, depth)
        }
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [slug, targetId, enabled])

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="fixed inset-x-0 top-16 z-40 h-[3px] bg-web-hairline"
    >
      <i className="block h-[3px] bg-brand-primary transition-[width] duration-100" style={{ width: `${value}%` }} />
    </div>
  )
}
