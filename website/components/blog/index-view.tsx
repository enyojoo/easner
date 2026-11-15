import Link from "next/link"
import { notFound } from "next/navigation"
import { CtaBand } from "@/components/marketing/cta-band"
import { Eyebrow } from "@/components/ds/eyebrow"
import { Headline } from "@/components/ds/headline"
import { homeCtaBand } from "@/lib/marketing/content/home"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { BLOG_PATH } from "@/lib/blog/config"
import { getAllPosts, getCategories, paginate, pickFeatured } from "@/lib/blog/queries"
import { pagePath } from "@/lib/blog/urls"
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/marketing/structured-data"
import { cn } from "@/lib/utils"
import { CategoryBar } from "./category-bar"
import { JsonLd } from "./json-ld"
import { LoadMore } from "./load-more"
import { PostCard, PostGrid } from "./post-card"

export const INDEX_TITLE = "Notes on moving money"
export const INDEX_SUBHEAD = "Guides, product updates and ideas on banking across borders, from the people building Easner."
export const INDEX_DESCRIPTION =
  "Guides, product updates and ideas on banking across borders, from the people building Easner: getting paid from abroad, paying suppliers and teams, and how money moves between countries."

/** The index (page 1 and `?page=N`): hero, featured trio, category bar, latest grid, load more, CTA. */
export async function IndexView({ page }: { page: number }) {
  const [all, categories] = await Promise.all([getAllPosts(), getCategories()])
  const featured = pickFeatured(all)
  const featuredIds = new Set(featured.map((p) => p.id))
  const paged = paginate(all.filter((p) => !featuredIds.has(p.id)), page)
  if (page > 1 && (page !== paged.page || paged.items.length === 0)) notFound()

  const shown = page === 1 ? [...featured, ...paged.items] : paged.items
  const path = pagePath(BLOG_PATH, page)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path }]),
          collectionPageJsonLd({
            name: page > 1 ? `Blog – page ${page}` : "Blog",
            description: page > 1 ? `${INDEX_DESCRIPTION} Page ${page} of ${paged.pageCount}.` : INDEX_DESCRIPTION,
            path,
            items: shown.map((p) => ({ name: p.title, path: `${BLOG_PATH}/${p.slug}` })),
          }),
        ]}
      />
      <section className="mx-auto grid w-full max-w-7xl justify-items-start gap-4 px-4 pb-8 pt-12 sm:px-6 md:pt-16 lg:px-8">
        <Eyebrow>Blog</Eyebrow>
        <Headline level="page" as="h1">{INDEX_TITLE}</Headline>
        <p className={cn("max-w-2xl text-web-body", MARKETING_BODY_TEXT)}>{INDEX_SUBHEAD}</p>
      </section>

      {all.length === 0 ? (
        <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-web-hairline bg-web-plate px-6 py-16 text-center">
            <h2 className="font-display text-xl font-bold text-web-ink">No posts yet</h2>
            <p className="mx-auto mt-3 max-w-md text-web-body">We are writing the first ones. Until then, the answers page covers what Easner is and how each product works.</p>
            <Link href="/answers" className="mt-6 inline-flex font-semibold text-web-link underline underline-offset-4">
              Read the answers
            </Link>
          </div>
        </section>
      ) : (
        <>
          {page === 1 && featured.length > 0 && (
            <section aria-label="Featured" className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-12 pt-4 sm:px-6 lg:grid-cols-[1.45fr_1fr] lg:gap-8 lg:px-8 lg:pb-12">
              <h2 className="sr-only">Featured posts</h2>
              <PostCard post={featured[0]} size="feature" priority />
              <div className="grid content-start gap-7 sm:grid-cols-2 lg:grid-cols-1">
                {featured.slice(1).map((post) => (
                  <PostCard key={post.id} post={post} excerpt={false} />
                ))}
              </div>
            </section>
          )}
          <CategoryBar categories={categories} activeSlug={null} />
          {paged.items.length > 0 && (
            <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
              <p className="mb-3 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-web-meta after:h-px after:flex-1 after:bg-web-hairline">
                {page === 1 ? "Latest" : `Page ${page}`}
              </p>
              <h2 className="sr-only">Latest posts</h2>
              <PostGrid posts={paged.items} />
              {page === 1 && paged.pageCount > 1 ? (
                <LoadMore base={BLOG_PATH} nextPage={2} pageCount={paged.pageCount} />
              ) : (
                <IndexPager page={page} pageCount={paged.pageCount} />
              )}
            </section>
          )}
        </>
      )}
      <CtaBand content={homeCtaBand} />
    </>
  )
}

function IndexPager({ page, pageCount }: { page: number; pageCount: number }) {
  if (pageCount <= 1) return null
  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-4 pt-10 text-sm">
      {page > 1 && (
        <Link href={pagePath(BLOG_PATH, page - 1)} rel="prev" className="font-medium text-web-link underline underline-offset-4">
          Previous page
        </Link>
      )}
      {page < pageCount && (
        <Link href={pagePath(BLOG_PATH, page + 1)} rel="next" className="font-medium text-web-link underline underline-offset-4">
          Next page
        </Link>
      )}
    </nav>
  )
}
