"use client"

import { ShieldCheck } from "lucide-react"
import { COMPLIANCE_STRIP } from "@/lib/marketing/shared-content"
import { MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

interface ComplianceStripProps {
  note?: string
}

export function ComplianceStrip({ note }: ComplianceStripProps) {
  return (
    <section className="bg-[#0F1110] pb-16 pt-8 text-white md:pb-24 md:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className={cn("font-unbounded font-bold text-white", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
              {COMPLIANCE_STRIP.headline}
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/68">{COMPLIANCE_STRIP.subhead}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {COMPLIANCE_STRIP.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-sm leading-6 text-white/78">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3AA6F8]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            {note && <p className="mt-6 text-sm leading-6 text-white/55">{note}</p>}
          </div>
          <div
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_24px_90px_rgba(0,0,0,0.35)]"
            aria-label="Security and compliance shield illustration"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(58,166,248,0.16),transparent_48%)]" />
            <div className="relative flex size-28 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 sm:size-32">
              <ShieldCheck className="size-14 text-[#3AA6F8] sm:size-16" strokeWidth={1.75} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
