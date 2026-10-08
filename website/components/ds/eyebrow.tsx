import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Eyebrow – a small tinted pill above a website headline (design system: components/Eyebrow). One or two words. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-web-eyebrow-border bg-surface-tint px-3 py-1 text-xs font-semibold text-brand-navy",
        className,
      )}
    >
      {children}
    </span>
  )
}
