"use client"

import { aboutMission } from "@/lib/marketing/content/about"
import { MARKETING_BODY_TEXT, MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

function MissionParagraph({ text, emphasis }: { text: string; emphasis?: string }) {
  if (!emphasis || !text.includes(emphasis)) {
    return <p className={cn(MARKETING_BODY_TEXT, "text-[#5F665F]")}>{text}</p>
  }

  const [before, after] = text.split(emphasis)
  return (
    <p className={cn(MARKETING_BODY_TEXT, "text-[#5F665F]")}>
      {before}
      <strong className="font-semibold text-[#0F1110]">{emphasis}</strong>
      {after}
    </p>
  )
}

export function AboutMissionSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className={cn("font-unbounded font-bold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
          {aboutMission.headlineLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        <div className="mx-auto mt-6 max-w-2xl space-y-5">
          {aboutMission.paragraphs.map((paragraph) => (
            <MissionParagraph key={paragraph} text={paragraph} emphasis={aboutMission.emphasis} />
          ))}
        </div>
      </div>
    </section>
  )
}
