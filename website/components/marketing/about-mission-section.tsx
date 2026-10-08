"use client"

import { aboutMission } from "@/lib/marketing/content/about"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

function MissionParagraph({ text, emphasis }: { text: string; emphasis?: string }) {
  if (!emphasis || !text.includes(emphasis)) {
    return <p className={cn(MARKETING_BODY_TEXT, "text-web-body")}>{text}</p>
  }

  const [before, after] = text.split(emphasis)
  return (
    <p className={cn(MARKETING_BODY_TEXT, "text-web-body")}>
      {before}
      <strong className="font-semibold text-web-ink">{emphasis}</strong>
      {after}
    </p>
  )
}

export function AboutMissionSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <Headline level="section">
          {aboutMission.headlineLines.map((line, index) => (
            <span key={line} className="block">
              {index > 0 && " "}
              {line}
            </span>
          ))}
        </Headline>
        <div className="mx-auto mt-6 max-w-2xl space-y-5">
          {aboutMission.paragraphs.map((paragraph) => (
            <MissionParagraph key={paragraph} text={paragraph} emphasis={aboutMission.emphasis} />
          ))}
        </div>
      </div>
    </section>
  )
}
