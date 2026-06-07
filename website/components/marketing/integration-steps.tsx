"use client"

import type { IntegrationStep } from "@/lib/marketing/types"
import { cn } from "@/lib/utils"

interface IntegrationStepsProps {
  headline?: string
  steps: IntegrationStep[]
  footnote?: string
  className?: string
}

export function IntegrationSteps({ headline, steps, footnote, className }: IntegrationStepsProps) {
  return (
    <section className={cn("bg-white pb-16 pt-8 md:pb-24 md:pt-12", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {headline && (
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12 lg:max-w-none lg:text-left">
            <h2 className="font-unbounded text-3xl font-semibold leading-tight text-[#0F1110] sm:text-4xl">
              {headline}
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative flex h-full flex-col rounded-[1.5rem] border border-[#E4DED1] bg-[#F8F6F0] p-6"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007ACC] text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 font-unbounded text-lg font-semibold leading-snug text-[#0F1110]">
                {step.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#5F665F]">{step.description}</p>
              {index < steps.length - 1 && (
                <div
                  className="absolute right-0 top-1/2 hidden h-px w-6 translate-x-full bg-[#D9D4C7] lg:block"
                  aria-hidden
                />
              )}
            </article>
          ))}
        </div>
        {footnote && (
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-[#5F665F] lg:text-left">
            {footnote}
          </p>
        )}
      </div>
    </section>
  )
}
