import Link from "next/link"
import type { ProductPageContent } from "@/lib/marketing/types"
import { CONTACT_PATH } from "@/lib/marketing/constants"
import { MarketingPageShell } from "./marketing-page-shell"
import { SplitSection } from "./split-section"
import { CenteredBlock } from "./centered-block"
import { FeatureAlternating } from "./feature-alternating"
import { TierLadder } from "./tier-ladder"
import { ThreeColCards } from "./three-col-cards"
import { ComplianceStrip } from "./compliance-strip"
import { CtaBand } from "./cta-band"

interface ProductPageProps {
  content: ProductPageContent
}

export function ProductPage({ content }: ProductPageProps) {
  return (
    <MarketingPageShell>
      <SplitSection
        h1
        headline={content.hero.h1}
        subhead={content.hero.subhead}
        visualSlot={content.hero.visualSlot}
        altText={content.hero.altText}
        badge={content.hero.badge}
        ctas={content.hero.ctas}
      />
      <CenteredBlock
        headline={content.problem.headline}
        body={content.problem.body}
        stat={content.problem.stat}
      />
      {content.solution && (
        <SplitSection
          headline={content.solution.headline}
          body={content.solution.body}
          bullets={content.solution.bullets}
          visualSlot={content.solution.visualSlot}
          altText={content.solution.altText}
          reverse={content.solution.reverse}
        />
      )}
      {content.features && content.features.length > 0 && (
        <FeatureAlternating features={content.features} />
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
          narrow={!!section.visualSlot}
        />
      ))}
      {content.commercialModels && (
        <ThreeColCards
          headline="Choose how you partner with Easner"
          items={content.commercialModels}
          columns={2}
          showIcons
        />
      )}
      {content.commercialModels && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center text-sm text-[#5F665F]">
          Commercial terms are customized.{" "}
          <Link href={CONTACT_PATH} className="font-semibold text-[#007ACC] hover:underline">
            Contact us
          </Link>{" "}
          for pricing.
        </div>
      )}
      {content.capabilities && (
        <ThreeColCards headline="API capabilities" items={content.capabilities} columns={3} />
      )}
      {content.segments && (
        <ThreeColCards headline="Who it's for" items={content.segments} />
      )}
      {content.tiers && <TierLadder variant={content.tiers} />}
      {content.tierNote && (
        <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#E4DED1] bg-white/85 px-6 py-5 text-sm leading-7 text-[#5F665F] shadow-sm">
            {content.tierNote}
          </div>
        </div>
      )}
      {content.useCases && (
        <ThreeColCards headline="Use cases" items={content.useCases} />
      )}
      {content.statusBanner && (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#BFE3FA] bg-[#EAF5FD] px-6 py-5 text-center text-sm font-medium leading-7 text-[#0A2540]">
            {content.statusBanner}
          </div>
        </div>
      )}
      <ComplianceStrip note={content.complianceNote} />
      <CtaBand content={content.ctaBand} />
    </MarketingPageShell>
  )
}
