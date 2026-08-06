"use client"

import Link from "next/link"
import type { ProductPageContent } from "@/lib/marketing/types"
import { CONTACT_PATH } from "@/lib/marketing/constants"
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
}

export function ProductPageSections({ content }: ProductPageSectionsProps) {
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
          headline={content.integrationStepsHeadline}
          steps={content.integrationSteps}
          footnote={content.integrationStepsFootnote}
        />
      )}
      {content.features && content.features.length > 0 && content.featuresLayout === "bento" && (
        <FeatureBento
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
        />
      )}
      {content.commercialModels && (
        <ThreeColCards
          headline="Choose how you partner with Easner"
          items={content.commercialModels}
          columns={content.commercialModels.length >= 3 ? 3 : 2}
          showIcons
        />
      )}
      {content.commercialModels && (
        <div className="mx-auto max-w-3xl px-4 pb-8 text-center text-sm text-[#5F665F] sm:px-6 lg:px-8">
          Commercial terms are customized.{" "}
          <Link href={CONTACT_PATH} className="font-semibold text-[#007ACC] hover:underline">
            Contact us
          </Link>{" "}
          for pricing.
        </div>
      )}
      {content.segments && (
        <ThreeColCards headline="Who it's for" items={content.segments} columns={4} />
      )}
      {content.tiers && <TierLadder variant={content.tiers} />}
      {content.tierNote && (
        <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#E4DED1] bg-white/85 px-6 py-5 text-sm leading-7 text-[#5F665F] shadow-sm">
            {content.tierNote}
          </div>
        </div>
      )}
      {content.statusBanner && (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#BFE3FA] bg-[#EAF5FD] px-6 py-5 text-center text-sm font-medium leading-7 text-[#0A2540]">
            {content.statusBanner}
          </div>
        </div>
      )}
      {content.faq && <FaqSection items={content.faq} />}
      <ComplianceStrip note={content.complianceNote} />
      <CtaBand content={content.ctaBand} />
    </>
  )
}
