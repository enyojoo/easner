"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import type { FaqItem } from "@/lib/marketing/types"

interface FaqSectionProps {
  items: FaqItem[]
}

export function FaqSection({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (items.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={cn("mb-12 text-center font-unbounded font-semibold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.question} className="overflow-hidden rounded-2xl border border-[#E4DED1] bg-[#F8F6F0]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/60"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="pr-4 font-semibold text-[#0F1110]">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 text-[#6F756F] transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 leading-8 text-[#5F665F]">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
