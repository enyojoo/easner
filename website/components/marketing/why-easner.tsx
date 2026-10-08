import { Headline } from "@/components/ds/headline"
import { cn } from "@/lib/utils"
import { whyEasnerHeadline, whyEasnerPillars } from "@/lib/marketing/content/home"

/** Why choose Easner as a proof row: each pillar leads with a figure, then its sentence. */
export function WhyEasner() {
  return (
    <section className="bg-web-band pb-14 pt-7 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Headline level="section" className="mb-9 text-center sm:mb-12">
          {whyEasnerHeadline}
        </Headline>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {whyEasnerPillars.map((pillar) => (
            <div key={pillar.title} className="grid content-start gap-3 rounded-xl border border-web-hairline bg-web-canvas/90 p-6 shadow-soft sm:rounded-2xl sm:p-7">
              <div
                className={cn(
                  "flex min-h-12 items-end font-semibold leading-none tracking-[-0.03em] text-web-ink tabular-nums",
                  (pillar.stat?.length ?? 0) > 5 ? "text-2xl sm:text-[1.75rem]" : "text-[2.5rem] sm:text-5xl",
                )}
              >
                {pillar.stat}
              </div>
              <div className="mt-2 text-base font-semibold text-web-ink sm:text-lg">{pillar.title}</div>
              <p className="text-[15px] leading-6 text-web-body">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
