import type { ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Headline – the Easner brand voice in type (design system: components/Headline).
 * Unbounded Bold in web-ink. Write headlines in sentence or title case; the levels that should be
 * uppercase are uppercased here, never typed in caps.
 */
export type HeadlineLevel = "hero" | "page" | "section" | "display" | "sub"

const DEFAULT_TAG: Record<HeadlineLevel, ElementType> = {
  hero: "h1",
  page: "h1",
  section: "h2",
  display: "h2",
  sub: "h3",
}

const LEVEL_CLASS: Record<HeadlineLevel, string> = {
  /** Home h1 only. On phones each line stays on one row: the size follows the screen width (longest line ≈ 12 em). */
  hero: "uppercase text-[min(2rem,calc((100vw-2rem)/12.4))] max-sm:whitespace-nowrap sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl leading-[1.12] tracking-[-0.025em] sm:tracking-[-0.02em]",
  /** Product and inner-page h1, one step below the home hero. */
  page: "uppercase text-balance text-[1.5rem] min-[390px]:text-[1.625rem] sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-5xl leading-[1.15] tracking-[-0.02em]",
  /** Section h2. */
  section: "uppercase tracking-[0.04em] text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight",
  /** CTA panel and dialogs. */
  display: "uppercase tracking-[0.04em] text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight",
  /** In-section h3: sentence case. */
  sub: "text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight",
}

interface HeadlineProps {
  level?: HeadlineLevel
  as?: ElementType
  /** Render each entry as its own line; `accentLine` sets one in Easner blue (home hero). */
  lines?: string[]
  accentLine?: number
  id?: string
  className?: string
  children?: ReactNode
}

export function Headline({ level = "section", as, lines, accentLine, id, className, children }: HeadlineProps) {
  const Tag = as ?? DEFAULT_TAG[level]
  return (
    <Tag
      id={id}
      className={cn(
        "font-display font-bold text-web-ink",
        LEVEL_CLASS[level],
        className,
      )}
    >
      {lines
        ? lines.map((line, index) => (
            <span key={line} className={cn("block text-balance", index === accentLine && "text-brand-primary")}>
              {index > 0 && " "}
              {line}
            </span>
          ))
        : children}
    </Tag>
  )
}
