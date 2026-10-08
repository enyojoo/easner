"use client"

import type { IntegrationStep } from "@/lib/marketing/types"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

interface IntegrationStepsProps {
  headline?: string
  steps: IntegrationStep[]
  footnote?: string
  className?: string
  id?: string
}

export function IntegrationSteps({ headline, steps, footnote, className, id }: IntegrationStepsProps) {
  // Wait until xl: to go multi-column beyond 2 – at lg: (1024–1279px) a 3-4 column grid
  // is too narrow for a single long word in bold uppercase tracked letters (e.g. "DEPLOYMENT").
  const wideCols = steps.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"

  return (
    <section id={id} className={cn("scroll-mt-24 bg-white pb-16 pt-8 md:pb-24 md:pt-12", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {headline && (
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12 lg:max-w-none lg:text-left">
            <Headline level="section">
              {headline}
            </Headline>
          </div>
        )}
        <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 xl:gap-6", wideCols)}>
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative flex h-full flex-col rounded-[1.5rem] border border-web-hairline bg-web-plate p-6"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                {index + 1}
              </div>
              {/* Capped below the general sub scale – this grid gets narrower than most other card contexts. */}
              <Headline level="sub" className="mt-4 lg:text-2xl xl:text-2xl">
                {step.title}
              </Headline>
              <p className="mt-3 flex-1 text-sm leading-7 text-web-body">{step.description}</p>
              {index < steps.length - 1 && (
                <div
                  className="absolute right-0 top-1/2 hidden h-px w-6 translate-x-full bg-brand-stone xl:block"
                  aria-hidden
                />
              )}
            </article>
          ))}
        </div>
        {footnote && (
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-web-body lg:text-left">
            {footnote}
          </p>
        )}
      </div>
    </section>
  )
}
