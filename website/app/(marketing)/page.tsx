import type { Metadata } from "next"
import Script from "next/script"
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
  title: {
    absolute: homeMetadata.title,
  },
  description: homeMetadata.description,
  keywords: homeMetadata.keywords,
  openGraph: {
    title: homeMetadata.title,
    description: homeMetadata.description,
  },
}

export default function HomePage() {
  return (
    <>
      <Script id="products-hash-scroll" strategy="beforeInteractive">
        {`
          (function () {
            if (window.location.hash !== "#products") return;

            function scrollToProducts() {
              var products = document.getElementById("products");
              if (!products) return;

              var html = document.documentElement;
              var previousScrollBehavior = html.style.scrollBehavior;
              var scrollMarginTop = parseFloat(window.getComputedStyle(products).scrollMarginTop) || 96;
              var top = products.getBoundingClientRect().top + window.scrollY - scrollMarginTop;

              html.style.scrollBehavior = "auto";
              window.scrollTo(0, top);

              window.requestAnimationFrame(function () {
                html.style.scrollBehavior = previousScrollBehavior;
              });
            }

            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", scrollToProducts, { once: true });
            } else {
              scrollToProducts();
            }

            window.requestAnimationFrame(scrollToProducts);
            window.setTimeout(scrollToProducts, 80);
            window.setTimeout(scrollToProducts, 180);
          })();
        `}
      </Script>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
        <TrustedBy />
      </div>
      <WhyEasner />
      <SolutionsByAudience />
      <ProductGrid />
      <CorridorStory />
      <ComplianceStrip />
      <CtaBand content={homeCtaBand} />
    </>
  )
}
