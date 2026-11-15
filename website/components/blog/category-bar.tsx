import Link from "next/link"
import { Rss } from "lucide-react"
import type { CategoryWithCount } from "@/lib/blog/types"
import { categoryPath } from "@/lib/blog/urls"
import { CategoryChips } from "./category-chips"
import { SearchButton } from "./search-dialog"

/**
 * The category bar (WebBlogIndex / WebBlogArchive): chips that are real links to /blog/categories/<slug>, never
 * client filters, then the search pill and the RSS link. Sticky under the header on scroll.
 */
export function CategoryBar({ categories, activeSlug, feedHref = "/blog/feed.xml" }: { categories: CategoryWithCount[]; activeSlug: string | null; feedHref?: string }) {
  return (
    <div className="sticky top-16 z-30 border-y border-web-hairline bg-web-canvas/92 backdrop-blur supports-[backdrop-filter]:bg-web-canvas/85">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:gap-4 md:py-3.5 lg:px-8">
        <div className="flex items-center gap-2 md:order-2 md:ml-auto">
          <SearchButton className="flex-1 md:flex-none" />
          <Link
            href={feedHref}
            aria-label="RSS feed"
            className="grid size-11 shrink-0 md:size-9 place-items-center rounded-full bg-web-canvas text-web-nav shadow-[inset_0_0_0_1px_var(--web-hairline)] transition-colors hover:text-web-ink"
          >
            <Rss className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <CategoryChips
          className="md:order-1 md:min-w-0 md:flex-1"
          activeSlug={activeSlug}
          items={[{ slug: null, name: "All", href: "/blog" }, ...categories.map((c) => ({ slug: c.slug, name: c.name, href: categoryPath(c.slug) }))]}
        />
      </div>
    </div>
  )
}
