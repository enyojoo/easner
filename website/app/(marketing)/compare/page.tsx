import Link from "next/link"
import { CtaBand } from "@/components/marketing/cta-band"
import { comparePages, comparePath } from "@/lib/marketing/content/compare"
import { homeCtaBand } from "@/lib/marketing/content/home"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

const metadata_ = {
  title: "Compare Easner Connect and Business With Other Options",
  description:
    "Side-by-side comparisons of Easner Connect and Easner Business with Stripe Connect, PayPal Payouts, and Wise Business. Every competitor fact has a source and a date.",
  keywords: ["Easner comparison", "Easner alternatives", "Easner vs Wise", "Easner vs Stripe"],
}

export const metadata = marketingMetadata({ metadata: metadata_, path: "/compare", titleAbsolute: metadata_.title })

export default function CompareIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
          ]),
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <h1 className="text-3xl font-semibold leading-tight text-web-ink sm:text-4xl">Compare Easner</h1>
        <p className="mt-4 text-base leading-7 text-web-body sm:text-lg">
          How Easner Connect and Easner Business differ from other ways to pay and collect internationally. Every competitor
          fact comes from that company&apos;s own pages and carries a source and a date.
        </p>
        <ul className="mt-10 space-y-6">
          {comparePages.map((page) => (
            <li key={page.slug}>
              <Link href={comparePath(page)} className="text-lg font-semibold text-web-link underline underline-offset-4">
                {page.h1}
              </Link>
              <p className="mt-1 text-sm leading-6 text-web-body sm:text-base sm:leading-7">{page.metadata.description}</p>
            </li>
          ))}
        </ul>
      </article>
      <CtaBand content={homeCtaBand} />
    </>
  )
}
