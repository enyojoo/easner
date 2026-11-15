import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { pagePath } from "@/lib/blog/urls"
import { cn } from "@/lib/utils"

function pageList(page: number, count: number): (number | "gap")[] {
  if (count <= 6) return Array.from({ length: count }, (_, i) => i + 1)
  const keep = new Set([1, 2, page - 1, page, page + 1, count - 1, count].filter((n) => n >= 1 && n <= count))
  const sorted = [...keep].sort((a, b) => a - b)
  const out: (number | "gap")[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("gap")
    out.push(n)
  })
  return out
}

const ITEM = "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-web-body shadow-[inset_0_0_0_1px_var(--web-hairline)] transition-colors hover:text-web-ink"

/** Numbered pagination: every item is a real `?page=N` link, so crawlers and no-JS readers can page. */
export function Pagination({ base, page, pageCount }: { base: string; page: number; pageCount: number }) {
  if (pageCount <= 1) return null
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-center gap-1.5 pt-12">
      {page > 1 && (
        <Link href={pagePath(base, page - 1)} rel="prev" className={ITEM}>
          <ChevronLeft className="size-4" aria-hidden="true" /> Previous
        </Link>
      )}
      {pageList(page, pageCount).map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-web-meta" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={pagePath(base, entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(ITEM, entry === page && "bg-web-ink text-web-canvas shadow-none hover:text-web-canvas")}
          >
            {entry}
          </Link>
        ),
      )}
      {page < pageCount && (
        <Link href={pagePath(base, page + 1)} rel="next" className={ITEM}>
          Next <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  )
}
