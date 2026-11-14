import Link from "next/link"
import { formatDate, readTime } from "@/lib/blog/format"
import { postPath } from "@/lib/blog/urls"
import type { BlogPostSummary } from "@/lib/blog/types"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import { CoverImage } from "./cover-image"

type Size = "feature" | "standard" | "compact"

const CAT = "text-xs font-semibold uppercase leading-4 tracking-[0.08em] text-primary-text"

/**
 * WebBlogCard (design system): the one post card, in three sizes from the same data. The whole card is one link;
 * the category is text inside it, not a nested link. Titles clamp at 3 lines, excerpts at 2.
 */
export function PostCard({
  post,
  size = "standard",
  excerpt = true,
  priority,
}: {
  post: BlogPostSummary
  size?: Size
  /** The featured stack and compact cards omit the excerpt. */
  excerpt?: boolean
  priority?: boolean
}) {
  const href = postPath(post.slug)
  const first = post.authors[0]

  if (size === "compact") {
    return (
      <Link href={href} className="group flex min-w-0 items-center gap-4 rounded-md outline-offset-[6px]">
        <div className="w-[120px] shrink-0 overflow-hidden rounded-md border border-web-hairline">
          <CoverImage path={post.coverPath} alt={null} focal={post.coverFocal} sizes="120px" width={240} height={135} />
        </div>
        <div className="grid min-w-0 gap-1.5">
          <span className={CAT}>{post.category.name}</span>
          <h3 className="line-clamp-3 text-[15px] font-semibold leading-[22px] text-web-ink transition-colors group-hover:text-primary-text">{post.title}</h3>
          <span className="text-[13px] leading-[18px] text-web-meta">
            {formatDate(post.publishedAt)} · {readTime(post.readingMinutes)}
          </span>
        </div>
      </Link>
    )
  }

  const feature = size === "feature"
  return (
    <Link href={href} className="group flex min-w-0 flex-col gap-3.5 rounded-xl outline-offset-[6px]">
      <div
        className={cn(
          "overflow-hidden border border-web-hairline transition-shadow group-hover:shadow-showcase",
          feature ? "rounded-2xl" : "rounded-xl",
        )}
      >
        <CoverImage
          path={post.coverPath}
          alt={null}
          focal={post.coverFocal}
          sizes={feature ? "(min-width: 1024px) 700px, 100vw" : "(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw"}
          priority={priority}
        />
      </div>
      <span className={CAT}>{post.category.name}</span>
      <h3
        className={cn(
          "line-clamp-3 font-display font-bold tracking-[-0.005em] text-web-ink transition-colors group-hover:text-primary-text",
          feature ? "text-[22px] leading-[30px] sm:text-[30px] sm:leading-10" : "text-[18px] leading-[26px]",
        )}
      >
        {post.title}
      </h3>
      {excerpt && (
        <p className={cn("line-clamp-2 text-web-body", feature ? "text-[17px] leading-7" : "text-[15px] leading-6")}>{post.excerpt}</p>
      )}
      <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium leading-[18px] text-web-body">
        {first && <Avatar author={first} size={28} />}
        {first && <span className="truncate">{post.authors.map((a) => a.name).join(", ")}</span>}
        <span aria-hidden="true" className="size-[3px] shrink-0 rounded-full bg-web-meta" />
        <span className="shrink-0">{formatDate(post.publishedAt)}</span>
        <span aria-hidden="true" className="size-[3px] shrink-0 rounded-full bg-web-meta" />
        <span className="shrink-0">{readTime(post.readingMinutes)}</span>
      </span>
    </Link>
  )
}

/** The 3-column grid used by the index, archives and author pages: 40px row gap, 28px column gap. */
export function PostGrid({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
