"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  text: string
  level: 2 | 3 | 4
}

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "")
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current = ids[0] ?? ""
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 120) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ids])
  return active
}

/** "On this page" with a scroll-spy highlight. Sticky rail at 1280px and up; a collapsible row under the cover below. */
export function PostToc({ items, variant }: { items: TocItem[]; variant: "rail" | "inline" }) {
  const active = useScrollSpy(items.map((i) => i.id))
  const [open, setOpen] = useState(false)
  if (items.length < 2) return null

  const list = (
    <nav aria-label="On this page" className="bp-toc">
      {variant === "rail" && <span className="lab">On this page</span>}
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(item.level === 3 && "sub", item.id === active && "on")}
          aria-current={item.id === active ? "location" : undefined}
          onClick={() => setOpen(false)}
        >
          {item.text}
        </a>
      ))}
    </nav>
  )

  if (variant === "rail") return <div className="sticky top-24 hidden self-start xl:block">{list}</div>
  return (
    <div className="rounded-md border border-web-hairline bg-web-plate xl:hidden">
      <button
        type="button"
        className="flex h-11 w-full items-center justify-between px-3.5 text-sm font-semibold text-web-ink"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        On this page
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && <div className="border-t border-web-hairline px-3.5 py-3">{list}</div>}
    </div>
  )
}
