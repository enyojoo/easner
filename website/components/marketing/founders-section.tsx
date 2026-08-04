"use client"

import Image from "next/image"
import { Linkedin } from "lucide-react"
import type { Founder } from "@/lib/marketing/types"
import { MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

interface FoundersSectionProps {
  headline: string
  subhead: string
  founders: Founder[]
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FounderCard({ founder }: { founder: Founder }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#E4DED1] bg-[#F8F6F0] shadow-[0_12px_35px_rgba(15,17,16,0.05)] transition-all hover:-translate-y-1 hover:border-[#007ACC]/30 hover:shadow-[0_20px_55px_rgba(15,17,16,0.09)] sm:rounded-[1.75rem]">
      <div className="relative aspect-square w-full overflow-hidden border-b border-[#E4DED1] bg-[#EDE8DC]">
        <Image
          src={founder.image}
          alt={`${founder.name}, ${founder.title}`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 100vw, 40vw"
          priority
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <h3 className="font-unbounded text-lg font-bold leading-snug text-[#0F1110] sm:text-xl">
          {founder.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-[#6F756F]">{founder.title}</p>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#007ACC]">{founder.tagline}</p>
        <div className="mt-4 space-y-3">
          {founder.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="text-sm leading-7 text-[#5F665F]">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DED1] bg-white text-[#3D443E] transition-colors hover:border-[#007ACC]/40 hover:text-[#007ACC]"
            aria-label={`${founder.name} on LinkedIn`}
          >
            <Linkedin className="h-4 w-4" />
          </a>
          {founder.x && (
            <a
              href={founder.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DED1] bg-white text-[#3D443E] transition-colors hover:border-[#007ACC]/40 hover:text-[#007ACC]"
              aria-label={`${founder.name} on X`}
            >
              <XIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export function FoundersSection({ headline, subhead, founders }: FoundersSectionProps) {
  return (
    <section className="bg-[#F6F3EB] pb-14 pt-7 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <h2 className={cn("font-unbounded font-bold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5F665F] sm:text-lg sm:leading-8">
            {subhead}
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {founders.map((founder) => (
            <FounderCard key={founder.name} founder={founder} />
          ))}
        </div>
      </div>
    </section>
  )
}
