"use client"

import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import { captureFaqExpanded } from "@/lib/marketing/analytics"
import { cn } from "@/lib/utils"
import { MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import type { FaqItem } from "@/lib/marketing/types"
import { MarketingLink } from "./marketing-link"

interface FaqSectionProps {
  items: FaqItem[]
  wideHeading?: boolean
}

export function FaqSection({ items, wideHeading = false }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const id = useId()

  if (items.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", wideHeading ? "max-w-7xl" : "max-w-4xl")}>
        <h2 className={cn("mb-12 text-center font-unbounded font-bold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
          Frequently asked questions
        </h2>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.question} className="overflow-hidden rounded-2xl border border-[#E4DED1] bg-[#F8F6F0]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-white/60 sm:px-6 sm:py-5"
                onClick={() => {
                  const nextIndex = openIndex === index ? null : index
                  if (nextIndex !== null) {
                    captureFaqExpanded(item.question, index)
                  }
                  setOpenIndex(nextIndex)
                }}
                aria-expanded={openIndex === index}
                aria-controls={`${id}-answer-${index}`}
                id={`${id}-question-${index}`}
              >
                <span
                  className="min-w-0 flex-1 pr-4 text-sm font-semibold leading-6 text-[#0F1110] sm:text-base"
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 text-[#6F756F] transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                id={`${id}-answer-${index}`}
                role="region"
                aria-labelledby={`${id}-question-${index}`}
                hidden={openIndex !== index}
                className="px-4 pb-5 leading-7 text-[#5F665F] sm:px-6"
              >
                <p>{item.answer}</p>
                {item.links && (
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {item.links.map((link) => (
                      <MarketingLink key={link.href} href={link.href} analyticsLocation="faq_related_page" ctaLabel={link.label} className="text-sm font-semibold text-[#0064A8] underline underline-offset-4">
                        {link.label}
                      </MarketingLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
