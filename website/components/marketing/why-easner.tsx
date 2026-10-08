import { Headline } from "@/components/ds/headline"
import { whyEasnerHeadline, whyEasnerPillars } from "@/lib/marketing/content/home"
import { PillarArt } from "./pillar-art"

/** Why choose Easner: each pillar leads with a small illustration of what it means, then its sentence. */
export function WhyEasner() {
  return (
    <section className="bg-web-band pb-14 pt-7 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Headline level="section" className="mb-9 text-center sm:mb-12">
          {whyEasnerHeadline}
        </Headline>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {whyEasnerPillars.map((pillar) => (
            <div
              key={pillar.title}
              className="grid content-start gap-3 overflow-hidden rounded-xl border border-web-hairline bg-web-canvas/90 shadow-soft sm:rounded-2xl"
            >
              {pillar.icon && (
                <div className="border-b border-web-hairline bg-web-plate px-4 py-3">
                  <PillarArt id={pillar.icon} className="mx-auto h-auto w-full max-w-[15rem]" />
                </div>
              )}
              <div className="grid gap-2 px-6 pb-6 pt-2 sm:px-7 sm:pb-7">
                <div className="text-base font-semibold text-web-ink sm:text-lg">{pillar.title}</div>
                <p className="text-[15px] leading-6 text-web-body">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
