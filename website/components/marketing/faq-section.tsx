"use client"

import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import { captureFaqExpanded } from "@/lib/marketing/analytics"
import { cn } from "@/lib/utils"
import type { FaqItem } from "@/lib/marketing/types"
import { MarketingLink } from "./marketing-link"
import { Headline } from "@/components/ds/headline"

interface FaqSectionProps {
  items: FaqItem[]
}

export function FaqSection({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const id = useId()

  if (items.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Headline level="section" className="mb-12 whitespace-nowrap text-center text-[13px] min-[360px]:text-[15px] sm:text-2xl">
          Frequently asked questions
        </Headline>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.question} className="overflow-hidden rounded-[16px] border border-web-hairline bg-web-plate">
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
                  className="min-w-0 flex-1 pr-4 text-sm font-semibold leading-6 text-web-ink sm:text-base"
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 text-web-meta transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                id={`${id}-answer-${index}`}
                role="region"
                aria-labelledby={`${id}-question-${index}`}
                hidden={openIndex !== index}
                className="px-4 pb-5 leading-7 text-web-body sm:px-6"
              >
                <p>{item.answer}</p>
                {item.links && (
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {item.links.map((link) => (
                      <MarketingLink key={link.href} href={link.href} analyticsLocation="faq_related_page" ctaLabel={link.label} className="text-sm font-semibold text-web-link underline underline-offset-4">
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
