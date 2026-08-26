"use client"

import { ArrowRight } from "lucide-react"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { aboutTrust } from "@/lib/marketing/content/about"
import { MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

export function AboutTrustSection() {
  return (
    <section className="bg-white pb-14 pt-7 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-[#E4DED1] bg-[#F8F6F0] p-6 shadow-[0_12px_35px_rgba(15,17,16,0.05)] sm:rounded-[1.75rem] sm:p-10">
          <h2 className={cn("font-unbounded font-bold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
            {aboutTrust.headline}
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5F665F] sm:text-lg sm:leading-8">{aboutTrust.body}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {aboutTrust.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 rounded-2xl border border-[#E4DED1] bg-white/80 p-4 text-sm leading-6 text-[#3D443E]"
              >
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#007ACC]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <MarketingLink
            href={aboutTrust.learnMoreHref}
            analyticsLocation="about_trust_compliance"
            ctaLabel={aboutTrust.learnMoreLabel}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#007ACC] transition-colors hover:text-[#0062A3]"
          >
            {aboutTrust.learnMoreLabel}
            <ArrowRight className="h-4 w-4" />
          </MarketingLink>
        </div>
      </div>
    </section>
  )
}
