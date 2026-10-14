import { Headline } from "@/components/ds/headline"
import { aiSections } from "@/lib/marketing/content/ai"
import { MarketingLink } from "./marketing-link"

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function AiAnswers() {
  return (
    <article className="bg-white">
      <header className="mx-auto max-w-4xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-14 lg:px-8">
        <Headline level="page">Answers about Easner</Headline>
        <p className="mt-6 text-base leading-7 text-web-body sm:text-lg sm:leading-8">
          Direct answers to what Easner is, who it is for, and how each product works. Open a product page for the
          full experience.
        </p>
        <nav aria-label="Answers" className="mt-8">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-web-link">
            {aiSections.map((section) => (
              <li key={section.href}>
                <a href={`#${slug(section.definition.term)}`} className="underline-offset-4 hover:underline">
                  {section.definition.question}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {aiSections.map((section) => {
        const id = slug(section.definition.term)
        return (
          <section
            key={section.href}
            id={id}
            className="scroll-mt-24 border-t border-web-hairline py-12 md:py-16"
            aria-labelledby={`${id}-heading`}
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <Headline id={`${id}-heading`} level="section" className="text-[15px] sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl">
                {section.definition.question}
              </Headline>
              <p className="aeo-answer mt-5 text-base leading-7 text-web-body sm:text-lg">
                {section.definition.answer}
              </p>
              {section.definition.facts && section.definition.facts.length > 0 && (
                <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                  {section.definition.facts.map((fact) => (
                    <div key={fact.term} className="rounded-[16px] border border-web-hairline bg-web-plate px-5 py-4">
                      <dt className="text-sm font-semibold text-web-ink">{fact.term}</dt>
                      <dd className="mt-1 text-sm leading-6 text-web-body">{fact.definition}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {section.howTo && (
                <div className="mt-10">
                  <h3 className="text-sm font-semibold text-web-ink sm:text-base">{section.howTo.name}</h3>
                  <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                    {section.howTo.steps.map((step, stepIndex) => (
                      <li key={step.name} className="rounded-[16px] border border-web-hairline bg-web-plate px-5 py-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                          {stepIndex + 1}
                        </span>
                        <h4 className="mt-3 text-sm font-semibold text-web-ink">{step.name}</h4>
                        <p className="mt-1 text-sm leading-6 text-web-body">{step.text}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {section.faq && section.faq.filter((item) => item.question !== section.definition.question).length > 0 && (
                <div className="mt-10 space-y-6">
                  {section.faq
                    .filter((item) => item.question !== section.definition.question)
                    .map((item) => (
                    <div key={item.question}>
                      <h3 className="text-sm font-semibold text-web-ink sm:text-base">{item.question}</h3>
                      <p className="mt-2 text-sm leading-6 text-web-body sm:text-base sm:leading-7">{item.answer}</p>
                      {item.links && (
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                          {item.links.map((link) => (
                            <MarketingLink
                              key={link.href}
                              href={link.href}
                              analyticsLocation="ai_faq_related_page"
                              ctaLabel={link.label}
                              className="text-sm font-semibold text-web-link underline underline-offset-4"
                            >
                              {link.label}
                            </MarketingLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-8 text-sm">
                <MarketingLink
                  href={section.href}
                  analyticsLocation="ai_product_page"
                  ctaLabel={section.label}
                  className="font-semibold text-web-link underline underline-offset-4"
                >
                  {section.label === "Home" ? "Go to the homepage" : `Open ${section.label}`}
                </MarketingLink>
              </p>
            </div>
          </section>
        )
      })}
    </article>
  )
}
