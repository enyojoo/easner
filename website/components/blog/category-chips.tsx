"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/** Category chips in one row. On phones the row scrolls sideways and the active chip is kept in view. */
export function CategoryChips({
  items,
  activeSlug,
  className,
}: {
  items: { slug: string | null; name: string; href: string }[]
  activeSlug: string | null
  className?: string
}) {
  const row = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const active = row.current?.querySelector<HTMLElement>('[aria-current="page"]')
    const box = row.current
    if (!active || !box || box.scrollWidth <= box.clientWidth) return
    box.scrollLeft = active.offsetLeft - (box.clientWidth - active.offsetWidth) / 2
  }, [activeSlug])
  return (
    <nav aria-label="Categories" className={className}>
      <div ref={row} className="bp-chips">
        {items.map((item) => {
          const on = item.slug === activeSlug
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
                on ? "bg-web-ink text-web-canvas" : "bg-web-canvas text-web-nav shadow-[inset_0_0_0_1px_var(--web-hairline)] hover:text-web-ink",
              )}
            >
              {item.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
