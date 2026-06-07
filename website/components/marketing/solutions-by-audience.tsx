"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  SPLIT_COPY_CARD,
  SPLIT_GRID_GAP,
  SPLIT_VISUAL_CONTAINER,
} from "@/lib/marketing/layout-constants"
import { VisualSlot } from "./visual-slot"
import { PersonaCtas } from "./persona-ctas"
import { solutionsPersonas } from "@/lib/marketing/content/home"

export function SolutionsByAudience() {
  const [active, setActive] = useState(0)
  const persona = solutionsPersonas[active]

  return (
    <section className="bg-white pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-unbounded text-3xl font-semibold leading-tight text-[#0F1110] sm:text-4xl">
            Built for how you move money
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#5F665F]">
            Pick the Easner surface that matches your work: mobile banking, business operations, or embedded infrastructure.
          </p>
        </div>
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {solutionsPersonas.map((p, index) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                active === index
                  ? "bg-[#0F1110] text-white"
                  : "border border-[#E4DED1] bg-[#F8F6F0] text-[#5F665F] hover:border-[#007ACC]/30 hover:text-[#0F1110]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className={cn("grid grid-cols-1 items-stretch lg:grid-cols-2", SPLIT_GRID_GAP)}>
          <div className={SPLIT_COPY_CARD}>
            <h3 className="font-unbounded text-2xl font-semibold leading-tight text-[#0F1110] sm:text-3xl">
              {persona.headline}
            </h3>
            <p className="mt-4 flex-1 text-lg leading-8 text-[#5F665F]">{persona.body}</p>
            <div className="mt-8 min-h-[3.25rem] shrink-0">
              <PersonaCtas ctas={persona.ctas} />
            </div>
          </div>
          <div className={SPLIT_VISUAL_CONTAINER}>
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
                  className="h-full"
                  priority={index === 0}
                  preload
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
