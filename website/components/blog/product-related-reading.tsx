import type { ProductSlug } from "@easner/blog-content"
import { getPostsForProduct } from "@/lib/blog/queries"
import { PostCard } from "./post-card"

/**
 * "Related reading" on a product page: the latest 3 posts linked to it. Renders nothing at all when there are none
 * (or when the blog cannot be read), so a product page never shows an empty state. Server component; the page stays
 * static and refreshes through the `blog` cache tag.
 */
export async function ProductRelatedReading({ product }: { product: ProductSlug }) {
  const posts = await getPostsForProduct(product)
  if (posts.length === 0) return null
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="product-related-reading">
      <h2
        id="product-related-reading"
        className="mb-3 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-web-meta after:h-px after:flex-1 after:bg-web-hairline"
      >
        Related reading
      </h2>
      <div className="grid gap-x-7 gap-y-10 pt-3 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  )
}
