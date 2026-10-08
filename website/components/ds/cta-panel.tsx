import type { ReactNode } from "react"
import { Headline } from "@/components/ds/headline"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

/** The dotted world map behind the CTA band, at 6% (design system: assets/textures/worldmap.svg). */
const WORLD_MAP_TEXTURE = "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/worldmap.svg"

interface CtaPanelProps {
  headline: ReactNode
  subhead?: ReactNode
  /** One or two pill Buttons, or a custom action block. */
  actions?: ReactNode
  texture?: boolean
  className?: string
}

/**
 * CtaPanel – the closing call to action on every marketing page (design system: components/CtaPanel).
 * An ivory band, a frosted white panel with a hairline border and shadow-panel, a display headline, a subhead and actions.
 */
export function CtaPanel({ headline, subhead, actions, texture = true, className }: CtaPanelProps) {
  return (
    <section className={cn("relative overflow-hidden bg-web-band pb-16 pt-8 md:pb-28 md:pt-14", className)}>
      {texture && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.06]"
          style={{ backgroundImage: `url('${WORLD_MAP_TEXTURE}')` }}
        />
      )}
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-5xl rounded-[1.5rem] border border-web-hairline bg-web-canvas/85 px-5 py-10 text-center shadow-panel backdrop-blur sm:rounded-[2rem] sm:px-10 md:py-16">
          <Headline level="display" className="mb-5 md:mb-6">
            {headline}
          </Headline>
          {subhead && <p className={cn("mx-auto max-w-3xl text-web-body", MARKETING_BODY_TEXT)}>{subhead}</p>}
          {actions}
        </div>
      </div>
    </section>
  )
}
