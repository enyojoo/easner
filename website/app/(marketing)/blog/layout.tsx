import type { ReactNode } from "react"
import { draftMode } from "next/headers"
import { BlogSearchProvider } from "@/components/blog/search-dialog"
import { getAllPosts, getCategories, pickFeatured } from "@/lib/blog/queries"
import "@/components/blog/blog.css"

/**
 * The blog frame: the ⌘K search dialog (categories and popular posts for its empty state) and the draft-preview
 * banner. The marketing layout above supplies the header, footer and the global Organization + WebSite JSON-LD.
 */
export default async function BlogLayout({ children }: { children: ReactNode }) {
  const [categories, posts, draft] = await Promise.all([getCategories(), getAllPosts(), draftMode()])
  const popular = pickFeatured(posts).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    categoryName: p.category.name,
    coverPath: p.coverPath,
    coverFocal: p.coverFocal,
    publishedAt: p.publishedAt,
    readingMinutes: p.readingMinutes,
  }))
  return (
    <BlogSearchProvider categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} popular={popular}>
      {draft.isEnabled && (
        <>
          <style>{`header.fixed{top:36px !important}main{padding-top:calc(4rem + 36px) !important}`}</style>
          <div className="fixed inset-x-0 top-0 z-[60] flex h-9 items-center justify-center gap-3 bg-brand-navy px-4 text-[13px] font-medium text-primary-foreground">
            <span>Preview, not published</span>
            <a href="/api/blog/preview?exit=1" className="underline underline-offset-2">
              Exit preview
            </a>
          </div>
        </>
      )}
      {children}
    </BlogSearchProvider>
  )
}
