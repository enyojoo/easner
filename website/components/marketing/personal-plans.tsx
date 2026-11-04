import { Amount } from "@/components/ds/amount"
import { Headline } from "@/components/ds/headline"
import { Button } from "@/components/ui/button"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { personalPlans, personalPlansFeeNote } from "@/lib/marketing/content/personal"
import { APP_LINK_URL } from "@/lib/marketing/constants"
import { cn } from "@/lib/utils"
import { MarketingLink } from "./marketing-link"

export function PersonalPlans() {
  return (
    <section className="px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Headline level="section">Personal plans</Headline>
        <p className={cn("mx-auto mt-3 max-w-xl text-web-body", MARKETING_BODY_TEXT)}>
          Everyday banking is always free, with Personal Ease Plus for people who send more often.
        </p>
      </div>
      <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
        {personalPlans.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-web-hairline bg-web-plate p-6",
              plan.highlighted && "border-brand-primary shadow-showcase",
            )}
          >
            <h3 className="font-display text-lg font-semibold tracking-[0.02em] text-web-ink">{plan.name}</h3>
            <p className="flex flex-wrap items-baseline gap-x-1.5 text-[2rem] font-bold leading-[2.375rem] tracking-[-0.03em] text-web-ink">
              {plan.price.amount === 0 ? (
                "Free"
              ) : (
                <>
                  <Amount value={plan.price.amount ?? 0} className="font-bold" />
                  {plan.price.interval && (
                    <span className="text-sm font-normal tracking-normal text-web-body">{plan.price.interval}</span>
                  )}
                </>
              )}
            </p>
            {plan.price.save && <p className="text-[13px] font-semibold leading-[18px] text-success-text">{plan.price.save}</p>}
            <p className="text-sm leading-[22px] text-web-body">{plan.sentence}</p>
            <ul className="grid flex-1 gap-2">
              {plan.features.map((feature) => (
                <li key={feature} className="relative pl-[18px] text-sm leading-5 text-web-ink">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[7px] size-2 rounded-full bg-surface-tint shadow-[inset_0_0_0_1.5px_var(--brand-primary)]"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild variant={plan.highlighted ? "primary" : "outline"} pill className="mt-2 w-full">
              <MarketingLink
                href={APP_LINK_URL}
                external
                analyticsLocation={`personal_plan_${plan.id}`}
                ctaLabel="Download"
                className="w-full justify-center"
              >
                Download the app
              </MarketingLink>
            </Button>
          </article>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-xl text-center text-[13px] leading-5 text-web-meta">{personalPlansFeeNote}</p>
    </section>
  )
}
