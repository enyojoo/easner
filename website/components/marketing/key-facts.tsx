import type { KeyFact } from "@/lib/marketing/types"
import { Headline } from "@/components/ds/headline"
import { LinkedText } from "./linked-text"
import { MarketingLink } from "./marketing-link"

interface KeyFactsProps {
  /** Product name, e.g. "Easner Connect". The heading reads "<title> at a glance". */
  title: string
  facts: KeyFact[]
  /** ISO date (YYYY-MM-DD). Shown as "Last updated". */
  lastReviewed?: string
}

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
}

/** A short, plain-text list of the facts people and answer engines ask for first. Fees stay on /pricing. */
export function KeyFacts({ title, facts, lastReviewed }: KeyFactsProps) {
  if (facts.length === 0) return null
  return (
    <section aria-labelledby="key-facts-heading" className="bg-white pb-4 pt-8 md:pb-6 md:pt-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Headline
          level="sub"
          as="h2"
          id="key-facts-heading"
          className="text-center text-xl sm:text-2xl md:text-2xl lg:text-left lg:text-2xl xl:text-2xl"
        >
          {title} at a glance
        </Headline>
        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-[1.25rem] border border-web-hairline bg-web-plate px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-web-meta">{fact.label}</dt>
              <dd className="mt-1.5 text-sm leading-6 text-web-ink">
                {fact.href ? (
                  <MarketingLink
                    href={fact.href}
                    analyticsLocation="key_facts_link"
                    ctaLabel={fact.value}
                    className="font-semibold text-web-link underline underline-offset-4"
                  >
                    {fact.value}
                  </MarketingLink>
                ) : (
                  <LinkedText text={fact.value} analyticsLocation="key_facts_inline" />
                )}
              </dd>
            </div>
          ))}
        </dl>
        {lastReviewed && (
          <p className="sr-only">
            Last updated <time dateTime={lastReviewed}>{formatDate(lastReviewed)}</time>
          </p>
        )}
      </div>
    </section>
  )
}
