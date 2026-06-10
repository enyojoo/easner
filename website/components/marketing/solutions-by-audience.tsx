"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  MARKETING_HEADING_CAPS,
  MARKETING_SECTION_TITLE,
  MARKETING_SUBSECTION_TITLE,
  SPLIT_COPY_CARD,
  SPLIT_GRID_GAP,
  PERSONA_VISUAL_CONTAINER,
} from "@/lib/marketing/layout-constants"
import { VisualSlot } from "./visual-slot"
import { PersonaCtas } from "./persona-ctas"
import { solutionsPersonas } from "@/lib/marketing/content/home"

export function SolutionsByAudience() {
  const sectionRef = useRef<HTMLElement>(null)
  const tabScrollTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const hashJumpTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const isTabScrollRef = useRef(false)
  const isHashJumpRef = useRef(false)
  const [active, setActive] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })
  const persona = solutionsPersonas[active]

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

    return () => {
      window.removeEventListener("hashchange", suspendForProductsHash)

      if (tabScrollTimeoutRef.current) {
        window.clearTimeout(tabScrollTimeoutRef.current)
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
    setActive(index)

    if (!sectionRef.current) return

    const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY
    const scrollableDistance = sectionRef.current.offsetHeight - window.innerHeight
    const segmentProgress = (index + 0.05) / solutionsPersonas.length
    isTabScrollRef.current = true

    if (tabScrollTimeoutRef.current) {
      window.clearTimeout(tabScrollTimeoutRef.current)
    }

    window.scrollTo({
      top: sectionTop + scrollableDistance * segmentProgress + 1,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })

    tabScrollTimeoutRef.current = window.setTimeout(
      () => {
        isTabScrollRef.current = false
      },
      prefersReducedMotion ? 0 : 700
    )
  }

  return (
    <section className="bg-white">
      <div className="mx-auto px-4 pt-8 text-center sm:px-6 sm:pt-12 lg:px-8">
        <div className="mx-auto max-w-3xl lg:max-w-none">
          <h2
            className={cn(
              "font-unbounded font-semibold text-[#0F1110] lg:whitespace-nowrap",
              MARKETING_SECTION_TITLE,
              MARKETING_HEADING_CAPS
            )}
          >
            Built for how you move money
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[#5F665F] sm:mt-4 sm:text-lg sm:leading-8">
            Pick the Easner surface that matches your work: personal banking, business operations, partner programs, or embedded infrastructure.
          </p>
        </div>
      </div>

      <div ref={sectionRef} className="h-[220vh] sm:h-[260vh] lg:h-[285vh]">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl sticky top-16 items-start px-4 py-4 sm:items-center sm:px-6 sm:py-5 lg:px-8">
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
                onClick={() => handleTabClick(index)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:py-2 sm:text-sm",
                  active === index
                    ? "bg-[#0F1110] text-white"
                    : "border border-[#E4DED1] bg-[#F8F6F0] text-[#5F665F] hover:border-[#007ACC]/30 hover:text-[#0F1110]"
                )}
              >
                {p.label}
              </button>
            ))}
            </div>
            <div className={cn("grid grid-cols-1 items-stretch gap-3 sm:gap-5 lg:grid-cols-2", SPLIT_GRID_GAP)}>
            <motion.div
              key={persona.id}
              id={`audience-panel-${persona.id}`}
              role="tabpanel"
              aria-labelledby={`audience-tab-${persona.id}`}
              className={cn(SPLIT_COPY_CARD, "min-h-[17.5rem] p-5 sm:min-h-[22rem] lg:min-h-[28rem]")}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
            >
              <h3 className={cn("font-unbounded font-semibold text-[#0F1110]", MARKETING_SUBSECTION_TITLE, MARKETING_HEADING_CAPS)}>
                {persona.headline}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#5F665F] sm:mt-4 sm:text-lg sm:leading-8">{persona.body}</p>
              <div className="mt-5 min-h-[3.25rem] shrink-0 sm:mt-8">
                <PersonaCtas ctas={persona.ctas} storeLayout="grid" />
              </div>
            </motion.div>
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
                    priority={index === 0}
                    preload
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
