import { AboutHero } from "@/components/marketing/about-hero"
import { AboutMissionSection } from "@/components/marketing/about-mission-section"
import { AboutTrustSection } from "@/components/marketing/about-trust-section"
import { CtaBand } from "@/components/marketing/cta-band"
import { FoundersSection } from "@/components/marketing/founders-section"
import { ThreeColCards } from "@/components/marketing/three-col-cards"
import {
  aboutCtaBand,
  aboutFounders,
  aboutFoundersHeadline,
  aboutFoundersSubhead,
  aboutMetadata,
  aboutPillars,
  aboutPillarsHeadline,
} from "@/lib/marketing/content/about"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: aboutMetadata, path: "/about" })

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ])
        )}
      />
      <AboutHero />
      <FoundersSection
        headline={aboutFoundersHeadline}
        subhead={aboutFoundersSubhead}
        founders={aboutFounders}
      />
      <AboutMissionSection />
      <ThreeColCards
        headline={aboutPillarsHeadline}
        headlineClassName="lg:whitespace-nowrap lg:text-2xl xl:text-3xl"
        items={aboutPillars}
        columns={2}
      />
      <AboutTrustSection />
      <CtaBand content={aboutCtaBand} />
    </>
  )
}
