"use client"

import { useState } from "react"
import { Amount } from "@/components/ds/amount"
import { Headline } from "@/components/ds/headline"
import { Button } from "@/components/ui/button"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { pricingHero, pricingPlanAccent, pricingPlans, type PricingInterval } from "@/lib/marketing/content/pricing"
import { cn } from "@/lib/utils"
import { MarketingLink } from "./marketing-link"

export function PricingPlans() {
  const [interval, setInterval] = useState<PricingInterval>("annual")

  return (
    <section className="px-4 pb-4 pt-8 sm:px-6 md:pt-14 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <Headline level="page">{pricingHero.h1}</Headline>
        <p className={cn("mx-auto mt-4 max-w-xl text-web-body", MARKETING_BODY_TEXT)}>{pricingHero.subhead}</p>
        <div
          role="group"
          aria-label="Billing period"
          className="mt-7 inline-flex rounded-full border border-web-hairline bg-web-band p-1"
        >
          {(["monthly", "annual"] as const).map((value) => {
            const selected = interval === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setInterval(value)}
                className={cn(
                  "inline-flex h-9 min-w-[6.75rem] items-center justify-center rounded-full px-4 text-sm font-semibold motion-safe:transition-colors motion-safe:duration-150",
                  selected ? "bg-web-canvas text-web-ink shadow-soft ring-1 ring-web-hairline" : "text-web-nav hover:text-web-ink",
                )}
              >
                {value === "monthly" ? "Monthly" : "Annual"}
              </button>
            )
          })}
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pricingPlans.map((plan) => {
          const price = plan[interval]
          const accent = pricingPlanAccent[plan.id]
          return (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border bg-web-plate p-6",
                accent?.card ?? "border-web-hairline",
                plan.highlighted && "shadow-showcase",
              )}
            >
              <h2 className={cn("font-display text-lg font-semibold tracking-[0.02em]", accent?.name ?? "text-web-ink")}>{plan.name}</h2>
              <p className="flex flex-wrap items-baseline gap-x-1.5 text-[2rem] font-bold leading-[2.375rem] tracking-[-0.03em] text-web-ink">
                {price.amount === null ? (
                  "Talk to us"
                ) : (
                  <>
                    <Amount value={price.amount} className="font-bold" />
                    {price.interval && (
                      <span className="text-sm font-normal tracking-normal text-web-body">{price.interval}</span>
                    )}
                  </>
                )}
              </p>
              {price.save && <p className="text-[13px] font-semibold leading-[18px] text-success-text">{price.save}</p>}
              <p className="text-sm leading-[22px] text-web-body md:min-h-11">{plan.sentence}</p>
              <ul className="grid flex-1 gap-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="relative pl-[18px] text-sm leading-5 text-web-ink">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-0 top-[7px] size-2 rounded-full bg-surface-tint shadow-[inset_0_0_0_1.5px_var(--brand-primary)]",
                        accent?.mark,
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild variant={plan.cta.external ? "primary" : "outline"} pill className="mt-2 w-full">
                <MarketingLink
                  href={plan.cta.href}
                  external={plan.cta.external}
                  analyticsLocation={plan.cta.analyticsLocation}
                  ctaLabel={plan.cta.label}
                  className="w-full justify-center"
                >
                  {plan.cta.label}
                </MarketingLink>
              </Button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
