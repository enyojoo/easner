import Link from "next/link"
import { notFound } from "next/navigation"
import { CtaBand } from "@/components/marketing/cta-band"
import { LinkedText } from "@/components/marketing/linked-text"
import { plainAnswer } from "@/lib/marketing/answer-text"
import { aiDetailByHref, aiProductPages } from "@/lib/marketing/content/ai"
import { homeCtaBand } from "@/lib/marketing/content/home"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { socialImages } from "@/lib/marketing/social-images"
import { breadcrumbJsonLd, faqPageJsonLd, jsonLdScript, webPageJsonLd } from "@/lib/marketing/structured-data"
import type { FaqItem } from "@/lib/marketing/types"

export const dynamicParams = false

export function generateStaticParams() {
  return aiProductPages.map((section) => ({ product: section.href.slice(1) }))
}

function findSection(product: string) {
  return aiProductPages.find((section) => section.href === `/${product}`)
}

function clip(text: string, max = 157) {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}...`
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export async function generateMetadata({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params
  const section = findSection(product)
  if (!section) notFound()
  const term = section.definition.term
  const title = term.includes("Easner") ? `${term}: answers` : `Easner ${term}: answers`
  return marketingMetadata({
    metadata: { title, description: clip(plainAnswer(section.definition.answer)) },
    path: `/answers/${product}`,
    titleAbsolute: title,
    images: [socialImages.answers],
  })
}

function QuestionList({ title, items }: { title: string; items: FaqItem[] }) {
  if (items.length === 0) return null
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-web-ink sm:text-2xl">{title}</h2>
      <div className="mt-6 space-y-8">
        {items.map((item) => (
          <div key={item.question} id={slug(item.question)} className="scroll-mt-28">
            <h3 className="text-base font-semibold text-web-ink">{item.question}</h3>
            <p className="mt-2 text-sm leading-6 text-web-body sm:text-base sm:leading-7"><LinkedText text={item.answer} analyticsLocation="answers_inline_url" /></p>
            {item.links && (
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                {item.links.map((link) =>
                  link.href.startsWith("http") ? (
                    <a key={link.href} href={link.href} className="text-sm font-semibold text-web-link underline underline-offset-4">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href} className="text-sm font-semibold text-web-link underline underline-offset-4">
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function AnswerProductPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params
  const section = findSection(product)
  if (!section) notFound()

  const common = section.faq ?? []
  const detail = aiDetailByHref[section.href] ?? []

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Answers", path: "/answers" },
            { name: section.label, path: `/answers/${product}` },
          ]),
          webPageJsonLd({
            name: section.definition.question,
            description: clip(plainAnswer(section.definition.answer)),
            path: `/answers/${product}`,
            speakable: true,
          }),
          faqPageJsonLd([...common, ...detail]),
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <nav className="text-sm">
          <Link href="/answers" className="font-semibold text-web-link underline underline-offset-4">
            All answers
          </Link>
        </nav>
        <h1 className="mt-6 text-3xl font-semibold leading-tight text-web-ink sm:text-4xl">{section.definition.question}</h1>
        <p className="aeo-answer mt-4 text-base leading-7 text-web-body sm:text-lg"><LinkedText text={section.definition.answer} analyticsLocation="answers_inline_url" /></p>
        <p className="mt-6 text-sm">
          <Link href={section.href} className="font-semibold text-web-link underline underline-offset-4">
            Open {section.label}
          </Link>
        </p>
        <QuestionList title="Common questions" items={common} />
        <QuestionList title="Countries and tax forms" items={detail} />
      </article>
      <CtaBand content={homeCtaBand} />
    </>
  )
}
