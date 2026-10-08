"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MARKETING_BODY_TEXT, SPLIT_COPY_CARD, SPLIT_GRID_GAP, PERSONA_VISUAL_CONTAINER } from "@/lib/marketing/layout-constants"
import { capturePersonaTabSelected } from "@/lib/marketing/analytics"
import { VisualSlot } from "./visual-slot"
import { PersonaCtas } from "./persona-ctas"
import { solutionsPersonas } from "@/lib/marketing/content/home"
import { Headline } from "@/components/ds/headline"

/**
 * The four audiences as tabs. Click or arrow keys switch them; every panel stays in the HTML for search
 * and answer engines. (Previously pinned on scroll, which took about four screens to pass.)
 */
export function SolutionsByAudience() {
  const [active, setActive] = useState(0)

  const handleTabClick = (index: number) => {
    const persona = solutionsPersonas[index]
    capturePersonaTabSelected(persona.id, persona.label)
    setActive(index)
  }

  return (
    <section className="bg-web-canvas pb-14 pt-8 sm:pb-20 sm:pt-12">
      <div className="mx-auto px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:max-w-none">
          <Headline level="section" className="lg:whitespace-nowrap">
            Built for how you move money
          </Headline>
          <p className={cn("mx-auto mt-3 max-w-3xl text-web-body sm:mt-4", MARKETING_BODY_TEXT)}>
            For your everyday money, your business payments, or the next product you build. Choose the Easner account or integration that fits.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="mx-auto flex max-w-7xl items-start px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div
              className="mb-4 flex flex-wrap justify-center gap-2 sm:mb-8"
              role="tablist"
              aria-label="Ways to use Easner"
            >
            {solutionsPersonas.map((p, index) => (
              <button
                key={p.id}
                id={`audience-tab-${p.id}`}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-controls={`audience-panel-${p.id}`}
                tabIndex={active === index ? 0 : -1}
                onKeyDown={(event) => {
                  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"]
                  if (!keys.includes(event.key)) return
                  event.preventDefault()
                  const next = event.key === "Home" ? 0 : event.key === "End" ? solutionsPersonas.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + solutionsPersonas.length) % solutionsPersonas.length
                  handleTabClick(next)
                  document.getElementById(`audience-tab-${solutionsPersonas[next].id}`)?.focus({ preventScroll: true })
                }}
                onClick={() => handleTabClick(index)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:py-2 sm:text-sm",
                  active === index
                    ? "bg-web-ink text-white"
                    : "border border-web-hairline bg-web-plate text-web-body hover:border-brand-primary/30 hover:text-web-ink"
                )}
              >
                {p.label}
              </button>
            ))}
            </div>
            <div className={cn("grid grid-cols-1 items-stretch gap-3 sm:gap-5 lg:grid-cols-2", SPLIT_GRID_GAP)}>
            {solutionsPersonas.map((persona, index) => (
              <div
                key={persona.id}
                id={`audience-panel-${persona.id}`}
                role="tabpanel"
                tabIndex={0}
                aria-labelledby={`audience-tab-${persona.id}`}
                hidden={active !== index}
                className={cn(SPLIT_COPY_CARD, "min-h-[17.5rem] p-5 sm:min-h-[22rem] lg:min-h-[28rem]", active !== index && "!hidden")}
              >
                <Headline level="sub">
                  {persona.headline}
                </Headline>
                <p className={cn("mt-3 flex-1 text-web-body sm:mt-4", MARKETING_BODY_TEXT)}>{persona.body}</p>
                <div className="mt-5 min-h-[3.25rem] shrink-0 sm:mt-8">
                  <PersonaCtas ctas={persona.ctas} storeLayout="grid" surface={`homepage_persona_${persona.id}`} />
                </div>
              </div>
            ))}
            <div className={PERSONA_VISUAL_CONTAINER}>
              {solutionsPersonas.map((p, index) => (
                <div
                  key={p.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-300 ease-out",
                    active === index ? "z-10 opacity-100" : "z-0 opacity-0"
                  )}
                  aria-hidden={active !== index}
                >
                  <VisualSlot
                    assetId={p.visualSlot}
                    alt={p.altText}
                    aspect="fill"
                    className="h-full rounded-none border-0 bg-transparent shadow-none"
                  />
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
