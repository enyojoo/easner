"use client"

import { COMPLIANCE_STRIP } from "@/lib/marketing/shared-content"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"
import { MarketingLink } from "./marketing-link"
import { SecurityIllustration } from "./security-illustration"
import { Headline } from "@/components/ds/headline"

interface ComplianceStripProps {
  note?: string
}

export function ComplianceStrip({ note }: ComplianceStripProps) {
  return (
    <section className="bg-brand-navy pb-16 pt-8 text-white md:pb-24 md:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Headline level="section" className="text-white">
              {COMPLIANCE_STRIP.headline}
            </Headline>
            <p className={cn("mt-4 text-white/68", MARKETING_BODY_TEXT)}>{COMPLIANCE_STRIP.subhead}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {COMPLIANCE_STRIP.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-white/[0.07] p-4 text-sm leading-6 text-white/78">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-web-accent-on-graphite" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <MarketingLink href="/compliance" analyticsLocation="compliance_policy" ctaLabel="Learn about verification and eligibility" className="mt-6 inline-block text-sm font-semibold text-web-accent-on-graphite underline underline-offset-4">
              Learn about verification and eligibility
            </MarketingLink>
            {note && <p className="mt-6 text-sm leading-6 text-white/55">{note}</p>}
          </div>
          <SecurityIllustration />
        </div>
      </div>
    </section>
  )
}
