import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * WebCard – a website copy card (design system: components/WebCard): web-plate fill, web-hairline border,
 * 24px corners stepping to 28px at sm+, a sentence-case Unbounded title and web-body copy.
 */
export function WebCard({
  title,
  icon,
  className,
  children,
}: {
  title: ReactNode
  icon?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={cn("grid gap-3 rounded-xl border border-web-hairline bg-web-plate p-5 sm:rounded-2xl sm:p-7", className)}>
      {icon}
      <h3 className="font-display text-xl font-bold leading-7 text-web-ink">{title}</h3>
      <div className="text-[15px] leading-6 text-web-body">{children}</div>
    </div>
  )
}
