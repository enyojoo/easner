import type { Metadata } from "next"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { TrustedBy } from "@/components/trusted-by"
import { HeroSection } from "@/components/marketing/hero-section"
import { WhyEasner } from "@/components/marketing/why-easner"
import { ProductGrid } from "@/components/marketing/product-grid"
import { SolutionsByAudience } from "@/components/marketing/solutions-by-audience"
import { CorridorStory } from "@/components/marketing/corridor-story"
import { ComplianceStrip } from "@/components/marketing/compliance-strip"
import { CtaBand } from "@/components/marketing/cta-band"
import { homeMetadata, homeCtaBand } from "@/lib/marketing/content/home"

export const metadata: Metadata = {
  title: homeMetadata.title,
  description: homeMetadata.description,
  keywords: homeMetadata.keywords,
  openGraph: {
    title: homeMetadata.title,
    description: homeMetadata.description,
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#0F1110]">
      <PublicHeader />
      <main className="relative overflow-hidden pt-[4.5rem]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_18%_10%,rgba(0,122,204,0.12),transparent_32%),linear-gradient(180deg,#FFFFFF_0%,rgba(246,243,235,0)_75%)]" />
        <div className="relative">
          <HeroSection />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
          <TrustedBy />
        </div>
        <WhyEasner />
        <SolutionsByAudience />
        <ProductGrid />
        <CorridorStory />
        <ComplianceStrip />
        <CtaBand content={homeCtaBand} />
      </main>
      <PublicFooter />
    </div>
  )
}
