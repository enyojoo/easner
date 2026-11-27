import Link from "next/link"
import { notFound } from "next/navigation"
import { ComplianceStrip } from "@/components/marketing/compliance-strip"
import { CtaBand } from "@/components/marketing/cta-band"
import { businessContent } from "@/lib/marketing/content/business"
import { checkoutContent } from "@/lib/marketing/content/checkout"
import { developersContent } from "@/lib/marketing/content/developers"
import { partnersContent } from "@/lib/marketing/content/partners"
import { payrollContent } from "@/lib/marketing/content/payroll"
import { personalContent } from "@/lib/marketing/content/personal"
import { comparePages, comparePath, findComparePage } from "@/lib/marketing/content/compare"
import { connectContent } from "@/lib/marketing/content/connect"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { socialImages } from "@/lib/marketing/social-images"
import { breadcrumbJsonLd, faqPageJsonLd, jsonLdScript, webPageJsonLd } from "@/lib/marketing/structured-data"

export const dynamicParams = false

/** The call to action of the Easner product each comparison is about. */
const CTA_BANDS: Record<string, typeof connectContent.ctaBand> = {
  "/business": businessContent.ctaBand,
  "/checkout": checkoutContent.ctaBand,
  "/connect": connectContent.ctaBand,
  "/developers": developersContent.ctaBand,
  "/payroll": payrollContent.ctaBand,
  "/personal": personalContent.ctaBand,
  "/white-label": partnersContent.ctaBand,
}

export function generateStaticParams() {
  return comparePages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = findComparePage(slug)
  if (!page) notFound()
  return marketingMetadata({ metadata: page.metadata, path: comparePath(page), titleAbsolute: page.metadata.title, images: [socialImages.home] })
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

const linkClass = "font-semibold text-web-link underline underline-offset-4"

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = findComparePage(slug)
  if (!page) notFound()

  const path = comparePath(page)
  const ctaBand = (CTA_BANDS[page.easnerHref] ?? connectContent.ctaBand)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: page.h1, path },
          ]),
          webPageJsonLd({
            name: page.metadata.title,
            description: page.metadata.description,
            path,
            speakable: true,
            dateModified: page.lastChecked,
          }),
          faqPageJsonLd(page.faq),
        ])}
      />
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <nav className="text-sm">
          <Link href="/compare" className={linkClass}>
            All comparisons
          </Link>
        </nav>
        <h1 className="mt-6 text-3xl font-semibold leading-tight text-web-ink sm:text-4xl">{page.h1}</h1>
        <p className="aeo-answer mt-4 text-base leading-7 text-web-body sm:text-lg">{page.answer}</p>
        <p className="mt-3 text-xs text-web-meta">
          Competitor facts checked <time dateTime={page.lastChecked}>{formatDate(page.lastChecked)}</time> on {page.otherName}&apos;s own pages.
        </p>

        <div className="mt-10 overflow-x-auto rounded-[1.25rem] border border-web-hairline">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm leading-6">
            <caption className="sr-only">
              {page.easnerName} compared with {page.otherName}
            </caption>
            <thead className="bg-web-plate text-web-ink">
              <tr>
                <th scope="col" className="w-1/5 px-4 py-3 font-semibold" />
                <th scope="col" className="w-2/5 px-4 py-3 font-semibold">
                  {page.easnerName}
                </th>
                <th scope="col" className="w-2/5 px-4 py-3 font-semibold">
                  {page.otherName}
                </th>
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => (
                <tr key={row.dimension} className="border-t border-web-hairline align-top">
                  <th scope="row" className="px-4 py-4 font-semibold text-web-ink">
                    {row.dimension}
                  </th>
                  <td className="px-4 py-4 text-web-body">
                    {row.easner}
                    {row.easnerHref && (
                      <>
                        {" "}
                        <Link href={row.easnerHref} className={linkClass}>
                          More
                        </Link>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-4 text-web-body">
                    {row.other}
                    {row.sourceUrl && (
                      <>
                        {" "}
                        <a href={row.sourceUrl} rel="noopener" className={linkClass}>
                          Source
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {page.note && <p className="mt-4 text-xs leading-5 text-web-meta">{page.note}</p>}

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-web-ink">Choose {page.easnerName} when</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-web-body sm:text-base sm:leading-7">
            {page.chooseEasner.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-web-ink sm:text-2xl">Common questions</h2>
          <div className="mt-6 space-y-8">
            {page.faq.map((item) => (
              <div key={item.question}>
                <h3 className="text-base font-semibold text-web-ink">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-web-body sm:text-base sm:leading-7">{item.answer}</p>
                {item.links && (
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                    {item.links.map((link) => (
                      <Link key={link.href} href={link.href} className={`text-sm ${linkClass}`}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-sm">
          <Link href={page.easnerHref} className={linkClass}>
            Open {page.easnerName}
          </Link>
        </p>
        <p className="mt-6 text-xs leading-5 text-web-meta">
          {page.otherName} is a trademark of its owner. Easner is not affiliated with {page.otherName}. Details can change, so check{" "}
          {page.otherName}&apos;s own pages before you decide.
        </p>
      </article>
      <ComplianceStrip />
      <CtaBand content={ctaBand} />
    </>
  )
}
