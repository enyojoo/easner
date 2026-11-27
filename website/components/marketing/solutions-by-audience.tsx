"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion"
import { cn } from "@/lib/utils"
import { MARKETING_BODY_TEXT, SPLIT_COPY_CARD, SPLIT_GRID_GAP, PERSONA_VISUAL_CONTAINER } from "@/lib/marketing/layout-constants"
import { capturePersonaTabSelected } from "@/lib/marketing/analytics"
import { VisualSlot } from "./visual-slot"
import { PersonaCtas } from "./persona-ctas"
import { solutionsPersonas } from "@/lib/marketing/content/home"
import { Headline } from "@/components/ds/headline"

export function SolutionsByAudience() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const tabScrollFrameRef = useRef<number | null>(null)
  const hashJumpTimeoutRef = useRef<number | null>(null)
  const isTabScrollRef = useRef(false)
  const isHashJumpRef = useRef(false)
  const [active, setActive] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  useEffect(() => {
    const suspendForProductsHash = () => {
      if (window.location.hash !== "#products") return

      isHashJumpRef.current = true

      if (hashJumpTimeoutRef.current) {
        window.clearTimeout(hashJumpTimeoutRef.current)
      }

      hashJumpTimeoutRef.current = window.setTimeout(() => {
        isHashJumpRef.current = false
      }, 900)
    }

    suspendForProductsHash()
    window.addEventListener("hashchange", suspendForProductsHash)

    // If the visitor takes over (wheel, touch, keys) while a tab click is still scrolling, stop holding the lock.
    const releaseTabScroll = () => {
      isTabScrollRef.current = false
      if (tabScrollFrameRef.current) {
        window.cancelAnimationFrame(tabScrollFrameRef.current)
        tabScrollFrameRef.current = null
      }
    }
    window.addEventListener("wheel", releaseTabScroll, { passive: true })
    window.addEventListener("touchstart", releaseTabScroll, { passive: true })
    window.addEventListener("keydown", releaseTabScroll)

    return () => {
      window.removeEventListener("hashchange", suspendForProductsHash)
      window.removeEventListener("wheel", releaseTabScroll)
      window.removeEventListener("touchstart", releaseTabScroll)
      window.removeEventListener("keydown", releaseTabScroll)

      if (tabScrollFrameRef.current) {
        window.cancelAnimationFrame(tabScrollFrameRef.current)
      }

      if (hashJumpTimeoutRef.current) {
        window.clearTimeout(hashJumpTimeoutRef.current)
      }
    }
  }, [])

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isTabScrollRef.current || isHashJumpRef.current) return

    const nextIndex = Math.min(
      solutionsPersonas.length - 1,
      Math.max(0, Math.floor(latest * solutionsPersonas.length))
    )

    setActive((current) => (current === nextIndex ? current : nextIndex))
  })

  const handleTabClick = (index: number) => {
    const persona = solutionsPersonas[index]
    capturePersonaTabSelected(persona.id, persona.label)
    setActive(index)

    if (!sectionRef.current) return

    const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY
    const scrollableDistance = sectionRef.current.offsetHeight - window.innerHeight
    // Aim for the middle of the tab's stretch of scroll, so rounding or a small drift never lands on the tab before it.
    const segmentProgress = (index + 0.5) / solutionsPersonas.length
    const target = sectionTop + scrollableDistance * segmentProgress

    // Hold the scroll-driven tab switching until the scroll has actually arrived. A smooth scroll can start late and
    // take longer than any fixed delay, and letting go early made the tabs flick back through the ones in between.
    isTabScrollRef.current = true
    if (tabScrollFrameRef.current) window.cancelAnimationFrame(tabScrollFrameRef.current)

    window.scrollTo({ top: target, behavior: prefersReducedMotion ? "auto" : "smooth" })

    let startedAt = -1
    let lastY = window.scrollY
    let moved = false
    let stableSince = 0
    const settle = (now: number) => {
      if (startedAt < 0) {
        startedAt = now
        stableSince = now
      }
      const y = window.scrollY
      if (Math.abs(y - lastY) > 0.5) {
        moved = true
        lastY = y
        stableSince = now
      }
      const arrived = Math.abs(y - target) < 2
      const stopped = moved && now - stableSince > 140
      if (arrived || stopped || now - startedAt > 3000) {
        isTabScrollRef.current = false
        tabScrollFrameRef.current = null
        return
      }
      tabScrollFrameRef.current = window.requestAnimationFrame(settle)
    }
    tabScrollFrameRef.current = window.requestAnimationFrame(settle)
  }

  return (
    <section className="bg-web-canvas py-8 sm:py-12">
      <div className="mx-auto px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:max-w-none">
          <Headline level="section" className="lg:whitespace-nowrap">
            Built for how you move money
          </Headline>
          <p className={cn("mx-auto mt-3 max-w-3xl text-web-body sm:mt-4", MARKETING_BODY_TEXT)}>
            Run your business, pay the people on your app, manage your own money, or build on Easner. Choose the account or integration that fits.
          </p>
        </div>
      </div>

      <div
        ref={sectionRef}
        style={{ "--personas": solutionsPersonas.length } as CSSProperties}
        className="mt-3 h-[calc(var(--personas)*55vh)] sm:mt-4 sm:h-[calc(var(--personas)*65vh)] lg:h-[calc(var(--personas)*71.25vh)]"
      >
        <div className="mx-auto flex max-w-7xl sticky top-20 items-start px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div
              className="mx-auto mb-4 grid max-w-sm grid-cols-2 gap-1.5 sm:mb-8 sm:gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center"
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
