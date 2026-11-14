import Link from "next/link"
import { Avatar } from "@/components/blog/avatar"
import { Breadcrumb } from "@/components/blog/breadcrumb"
import { JsonLd } from "@/components/blog/json-ld"
import { CtaBand } from "@/components/marketing/cta-band"
import { Eyebrow } from "@/components/ds/eyebrow"
import { Headline } from "@/components/ds/headline"
import { homeCtaBand } from "@/lib/marketing/content/home"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { pluralPosts } from "@/lib/blog/format"
import { getAuthors } from "@/lib/blog/queries"
import { abs, authorPath, authorsPath } from "@/lib/blog/urls"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/marketing/structured-data"
import { cn } from "@/lib/utils"

export const revalidate = 3600

const DESCRIPTION = "Everyone who writes for the Easner blog, from our team and our guests, with the guides and updates they have published."

export const metadata = marketingMetadata({
  metadata: { title: "Authors", description: DESCRIPTION },
  path: authorsPath,
  images: [{ url: abs(`${authorsPath}/opengraph-image`), alt: "Easner Blog – The people writing" }],
  alternateTypes: { "application/rss+xml": "/blog/feed.xml" },
})

export default async function AuthorsPage() {
  const authors = await getAuthors()
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: "Authors", path: authorsPath }]),
          collectionPageJsonLd({
            name: "Authors",
            description: DESCRIPTION,
            path: authorsPath,
            items: authors.map((a) => ({ name: a.name, path: authorPath(a.slug) })),
          }),
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 md:pt-10 lg:px-8">
        <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: "Authors" }]} />
      </div>
      <section className="mx-auto grid w-full max-w-7xl justify-items-start gap-4 px-4 pb-16 pt-6 sm:px-6 md:pt-8 lg:px-8">
        <Eyebrow>Blog · Authors</Eyebrow>
        <Headline level="page" as="h1">The people writing</Headline>
        <p className={cn("max-w-2xl text-web-body", MARKETING_BODY_TEXT)}>Everyone who writes for the Easner blog, from our team and our guests.</p>
        {authors.length === 0 ? (
          <p className="mt-6 text-web-body">No authors yet.</p>
        ) : (
          <ul className="mt-6 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {authors.map((a) => (
              <li key={a.id}>
                <Link
                  href={authorPath(a.slug)}
                  className="grid h-full justify-items-start gap-2.5 rounded-xl border border-web-hairline bg-web-canvas p-6 transition-shadow hover:shadow-showcase"
                >
                  <Avatar author={a} size={72} />
                  <b className="font-display text-base font-bold leading-[22px] text-web-ink">{a.name}</b>
                  {a.title && <span className="text-sm leading-5 text-web-body">{a.title}</span>}
                  <span className="text-[13px] font-medium leading-[18px] text-web-meta">{pluralPosts(a.postCount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <CtaBand content={homeCtaBand} />
    </>
  )
}
