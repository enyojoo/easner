"use client"

import type { ReactNode } from "react"
import type { FaqItem, ProductPageContent } from "@/lib/marketing/types"
import { CONTACT_PATH } from "@/lib/marketing/constants"
import { MarketingLink } from "./marketing-link"
import { SplitSection } from "./split-section"
import { CenteredBlock } from "./centered-block"
import { FeatureAlternating } from "./feature-alternating"
import { FeatureBento } from "./feature-bento"
import { TierLadder } from "./tier-ladder"
import { ThreeColCards } from "./three-col-cards"
import { IntegrationSteps } from "./integration-steps"
import { ComplianceStrip } from "./compliance-strip"
import { CtaBand } from "./cta-band"
import { FaqSection } from "./faq-section"

interface ProductPageSectionsProps {
  content: ProductPageContent
  /** Rendered after use cases / tiers, before the FAQ. For a page-specific section that doesn't fit the generic content shape. */
  beforeFaq?: ReactNode
}

function faqWithDefinition(content: ProductPageContent): FaqItem[] {
  const faqs = content.faq ?? []
  const definition = content.definition
  if (!definition || faqs.some((item) => item.question === definition.question)) return faqs
  return [{ question: definition.question, answer: definition.answer }, ...faqs]
}

export function ProductPageSections({ content, beforeFaq }: ProductPageSectionsProps) {
  const faqs = faqWithDefinition(content)
  return (
    <>
      <SplitSection
        h1
        variant="hero"
        headline={content.hero.h1}
        subhead={content.hero.subhead}
        visualSlot={content.hero.visualSlot}
        altText={content.hero.altText}
        badge={content.hero.badge}
        ctas={content.hero.ctas}
        ctaDescription={content.hero.ctaDescription}
        note={content.hero.note}
      />
      {content.problem && (
        <CenteredBlock
          headline={content.problem.headline}
          body={content.problem.body}
          stat={content.problem.stat}
        />
      )}
      {content.solution && content.featuresLayout !== "bento" && (
        <SplitSection
          headline={content.solution.headline}
          body={content.solution.body}
          bullets={content.solution.bullets}
          visualSlot={content.solution.visualSlot}
          altText={content.solution.altText}
          reverse={content.solution.reverse}
          variant="content"
        />
      )}
      {content.integrationSteps && content.integrationSteps.length > 0 && (
        <IntegrationSteps
          id="integration"
          headline={content.integrationStepsHeadline}
          steps={content.integrationSteps}
          footnote={content.integrationStepsFootnote}
        />
      )}
      {content.features && content.features.length > 0 && content.featuresLayout === "bento" && (
        <FeatureBento
          id="features"
          features={content.features}
          headline={content.featuresHeadline}
          subhead={content.featuresSubhead}
        />
      )}
      {content.features && content.features.length > 0 && content.featuresLayout !== "bento" && (
        <FeatureAlternating features={content.features} headline={content.featuresHeadline} />
      )}
      {content.extraSections?.map((section, index) => (
        <SplitSection
          key={section.headline}
          headline={section.headline}
          body={section.body}
          bullets={section.bullets}
          visualSlot={section.visualSlot}
          altText={section.altText}
          reverse={index % 2 === 1}
          variant="content"
        />
      ))}
      {content.capabilities && (
        <ThreeColCards headline="API capabilities" items={content.capabilities} columns={3} />
      )}
      {content.useCases && (
        <ThreeColCards
          headline={content.useCasesHeadline ?? "Use cases"}
          subhead={content.useCasesSubhead}
          items={content.useCases}
          footerLinks={content.useCaseLinks}
        />
      )}
      {content.commercialModels && (
        <ThreeColCards
          headline={content.commercialModelsSection?.headline ?? "Choose how you partner with Easner"}
          subhead={content.commercialModelsSection?.subhead}
          items={content.commercialModels}
          columns={content.commercialModels.length >= 3 ? 3 : 2}
          showIcons
        />
      )}
      {content.commercialModels && (
        <div className="mx-auto max-w-3xl px-4 pb-8 text-center text-sm text-web-body sm:px-6 lg:px-8">
          Commercial terms are customized.{" "}
          <MarketingLink
            href={CONTACT_PATH}
            analyticsLocation={content.commercialModelsSection?.analyticsLocation ?? "developers_pricing_contact"}
            ctaLabel="Contact us"
            className="font-semibold text-brand-primary hover:underline"
          >
            Contact us
          </MarketingLink>{" "}
          for pricing.
        </div>
      )}
      {content.segments && (
        <ThreeColCards headline="Who it's for" items={content.segments} columns={4} />
      )}
      {content.tiers && <TierLadder variant={content.tiers} />}
      {content.tierNote && (
        <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-web-hairline bg-white/85 px-6 py-5 text-sm leading-7 text-web-body shadow-sm">
            {content.tierNote}
          </div>
        </div>
      )}
      {content.statusBanner && (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-web-eyebrow-border bg-surface-tint px-6 py-5 text-center text-sm font-medium leading-7 text-brand-navy">
            {content.statusBanner}
          </div>
        </div>
      )}
      {beforeFaq}
      {faqs.length > 0 && <FaqSection items={faqs} />}
      <ComplianceStrip note={content.complianceNote} />
      <CtaBand content={content.ctaBand} />
    </>
  )
}
