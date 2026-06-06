"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
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
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="flex min-h-[26rem] flex-col rounded-[1.75rem] border border-[#E4DED1] bg-[#F8F6F0] p-6 sm:min-h-[28rem] sm:p-8">
            <h3 className="font-unbounded text-2xl font-semibold leading-tight text-[#0F1110] sm:text-3xl">
              {persona.headline}
            </h3>
            <p className="mt-4 flex-1 text-lg leading-8 text-[#5F665F]">{persona.body}</p>
            <div className="mt-8 min-h-[3.25rem] shrink-0">
              <PersonaCtas ctas={persona.ctas} />
            </div>
          </div>
          <div className="min-h-[26rem] sm:min-h-[28rem]">
            <VisualSlot
              key={persona.visualSlot}
              assetId={persona.visualSlot}
              alt={persona.altText}
              aspect="fill"
              className="h-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
