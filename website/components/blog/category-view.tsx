import { notFound } from "next/navigation"
import { CtaBand } from "@/components/marketing/cta-band"
import { Headline } from "@/components/ds/headline"
import { homeCtaBand } from "@/lib/marketing/content/home"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { pluralPosts } from "@/lib/blog/format"
import { getCategories, getCategory, getPostsByCategory, paginate } from "@/lib/blog/queries"
import { categoryMeta } from "@/lib/blog/seo-text"
import { categoryPath, pagePath, postPath } from "@/lib/blog/urls"
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/marketing/structured-data"
import { cn } from "@/lib/utils"
import { Breadcrumb } from "./breadcrumb"
import { CategoryBar } from "./category-bar"
import { JsonLd } from "./json-ld"
import { Pagination } from "./pagination"
import { PostGrid } from "./post-card"
import { RichText } from "./prose"

/** A category archive (page 1 and `?page=N`). A category with no live posts 404s. */
export async function CategoryView({ slug, page }: { slug: string; page: number }) {
  const [category, categories] = await Promise.all([getCategory(slug), getCategories()])
  if (!category) notFound()
  const posts = await getPostsByCategory(category.id)
  const paged = paginate(posts, page)
  if (page > 1 && page !== paged.page) notFound()
  const base = categoryPath(slug)
  const path = pagePath(base, page)
  const meta = categoryMeta(category, page)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: category.name, path },
          ]),
          collectionPageJsonLd({
            name: meta.title,
            description: meta.description,
            path,
            items: paged.items.map((p) => ({ name: p.title, path: postPath(p.slug) })),
          }),
        ]}
      />
      <section className="mx-auto grid w-full max-w-7xl justify-items-start gap-3.5 px-4 pb-7 pt-10 sm:px-6 md:pt-14 lg:px-8">
        <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: category.name }]} />
        <Headline level="page" as="h1">{category.name}</Headline>
        <div className={cn("grid max-w-2xl gap-3 text-web-body", MARKETING_BODY_TEXT)}>
          <RichText value={category.intro ?? category.description} />
        </div>
        <span className="text-sm font-medium text-web-meta">{pluralPosts(category.postCount)}</span>
      </section>
      <CategoryBar categories={categories} activeSlug={slug} feedHref={`${base}/feed.xml`} />
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <h2 className="sr-only">{category.name} posts</h2>
        <PostGrid posts={paged.items} />
        <Pagination base={base} page={paged.page} pageCount={paged.pageCount} />
      </section>
      <CtaBand content={homeCtaBand} />
    </>
  )
}
