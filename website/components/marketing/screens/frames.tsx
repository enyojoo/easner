import type { CSSProperties, ReactNode } from "react"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

/** Native size of the phone canvas, including the device ring and room for its shadow. */
export const PHONE_CANVAS = { width: 400, height: 800 }
/** The phone screen itself (AppHome card). */
export const PHONE_SCREEN = { width: 360, height: 760 }

/**
 * A phone around an Easner app screen (design system: AppHome `.phone`): 360 × 760, 50px corners,
 * a graphite double ring and shadow-lift. Rendered at native size inside ScaledScreen.
 */
export function PhoneFrame({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn("grid place-items-center", className)}
      style={{ width: PHONE_CANVAS.width, height: PHONE_CANVAS.height, ...style }}
    >
      <div
        className="relative overflow-hidden rounded-[50px] shadow-[0_0_0_10px_var(--brand-graphite),0_0_0_11px_var(--brand-ink),var(--shadow-lift)]"
        style={{ width: PHONE_SCREEN.width, height: PHONE_SCREEN.height }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * A browser window around a product web screen: ivory chrome, three dots and the product URL,
 * which tells visitors where the screen lives (business.easner.com, checkout.easner.com).
 */
export function BrowserFrame({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-[20px] border border-web-hairline bg-web-plate", className)}>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-web-hairline bg-web-band px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-brand-stone" />
          <span className="size-2.5 rounded-full bg-brand-stone" />
          <span className="size-2.5 rounded-full bg-brand-stone" />
        </span>
        <span className="mx-auto flex h-7 min-w-[18rem] items-center justify-center gap-1.5 rounded-full bg-web-canvas/80 px-4 text-[13px] font-medium text-web-nav">
          <Lock className="size-3" strokeWidth={2.25} aria-hidden="true" />
          {url}
        </span>
        <span className="w-[42px]" aria-hidden="true" />
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  )
}
