import Link from "next/link"
import { notFound } from "next/navigation"
import {
  extractDefinitions,
  extractFaq,
  extractSources,
  extractSteps,
  headings,
} from "@easner/blog-content"
import { CtaBand } from "@/components/marketing/cta-band"
import { homeCtaBand } from "@/lib/marketing/content/home"
import { formatDate, readTime } from "@/lib/blog/format"
import { getPost, getRelated } from "@/lib/blog/queries"
import { richPlain } from "@/lib/blog/seo-text"
import { abs, authorPath, categoryPath, cropImageUrl, markdownPath, postPath, shareImageUrl } from "@/lib/blog/urls"
import {
  blogPostJsonLd,
  breadcrumbJsonLd,
  definedTermJsonLd,
  faqPageJsonLd,
  howToJsonLd,
} from "@/lib/marketing/structured-data"
import { Avatar } from "./avatar"
import { Breadcrumb } from "./breadcrumb"
import { CoverImage } from "./cover-image"
import { Helpful } from "./helpful"
import { JsonLd } from "./json-ld"
import { PostCard } from "./post-card"
import { Prose } from "./prose"
import { ReadingProgress } from "./reading-progress"
import { ShareRow } from "./share-row"
import { PostToc, type TocItem } from "./toc"
import type { BlogPost } from "@/lib/blog/types"

export const postDescription = (post: Pick<BlogPost, "seoDescription" | "summary" | "excerpt">) =>
  post.seoDescription ?? post.summary ?? post.excerpt

export const postDateModified = (post: Pick<BlogPost, "contentModifiedAt" | "publishedAt">) => post.contentModifiedAt ?? post.publishedAt

/** `/blog/<slug>`: header, cover, contents rail, article, share rail, then helpful, author cards, related and CTA. */
export async function PostView({ slug, draft }: { slug: string; draft: boolean }) {
  const post = await getPost(slug, { draft })
  if (!post) notFound()
  const related = await getRelated(post)
  const path = postPath(post.slug)
  const url = abs(path)
  const description = postDescription(post)

  const heads = headings(post.content)
  const hasSummary = post.content.content[0]?.type === "summary"
  const toc: TocItem[] = [
    ...(hasSummary ? [{ id: "summary", text: "Summary", level: 2 as const }] : []),
    ...heads.filter((h) => h.level <= 3).map((h) => ({ id: h.id, text: h.text, level: h.level })),
  ]

  const faq = extractFaq(post.content)
  const steps = extractSteps(post.content)
  const definitions = extractDefinitions(post.content)
  const stepsName = post.content.content.find((b) => b.type === "steps")?.attrs?.name
  const sources = extractSources(post.content)
  const images = [cropImageUrl(post, "16x9"), cropImageUrl(post, "4x3"), cropImageUrl(post, "1x1")].filter((u): u is string => Boolean(u))
  const modified = postDateModified(post)
  const updated = post.contentModifiedAt && post.contentModifiedAt.slice(0, 10) > post.publishedAt.slice(0, 10)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.category.name, path: categoryPath(post.category.slug) },
            { name: post.title, path },
          ]),
          ...blogPostJsonLd({
            path,
            headline: post.title,
            description,
            images: images.length ? images : [shareImageUrl(post)],
            datePublished: post.publishedAt,
            dateModified: modified,
            authors: post.authors.map((a) => ({ name: a.name, path: authorPath(a.slug) })),
            section: post.category.name,
            keywords: post.focusKeyword,
            wordCount: post.wordCount,
            readingMinutes: post.readingMinutes,
            sources,
            hasSummary,
          }),
          ...(faq.length ? [faqPageJsonLd(faq)] : []),
          ...(steps.length
            ? [howToJsonLd({ name: typeof stepsName === "string" && stepsName ? stepsName : post.title, description: post.summary ?? post.excerpt, steps })]
            : []),
          ...definitions.map((d) => definedTermJsonLd({ name: d.term, description: d.text })),
        ]}
      />
      <ReadingProgress slug={post.slug} enabled={!draft} />

      <header className="mx-auto grid w-full max-w-7xl justify-items-start gap-4 px-4 pt-10 sm:px-6 md:pt-12 lg:px-8">
        <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.category.name, href: categoryPath(post.category.slug), accent: true }]} />
        <h1 className="max-w-[900px] text-balance font-display text-[26px] font-bold leading-[34px] tracking-[-0.015em] text-web-ink sm:text-[36px] sm:leading-[44px] lg:text-[44px] lg:leading-[54px]">
          {post.title}
        </h1>
        {post.excerpt && <p className="max-w-[46rem] text-[17px] leading-7 text-web-body sm:text-[19px] sm:leading-8 lg:text-[21px] lg:leading-[33px]">{post.excerpt}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex -space-x-2">
              {post.authors.map((a) => (
                <Avatar key={a.id} author={a} size={40} className="ring-2 ring-web-canvas" />
              ))}
            </span>
            <div className="text-[13px] leading-[18px] text-web-meta">
              <b className="block text-sm font-semibold text-web-ink">
                {post.authors.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && ", "}
                    <Link href={authorPath(a.slug)} className="hover:text-primary-text">{a.name}</Link>
                  </span>
                ))}
              </b>
              {post.authors[0]?.title}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-[13px] font-medium leading-[18px] text-web-body">
            <span aria-hidden="true" className="hidden size-[3px] rounded-full bg-web-meta sm:block" />
            <span>Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></span>
            {updated && (
              <>
                <span aria-hidden="true" className="size-[3px] rounded-full bg-web-meta" />
                <span className="inline-flex h-6 items-center rounded-full bg-surface-tint px-2.5 text-xs font-semibold text-primary-text">
                  Updated <time className="ml-1" dateTime={modified}>{formatDate(modified)}</time>
                </span>
              </>
            )}
            <span aria-hidden="true" className="size-[3px] rounded-full bg-web-meta" />
            <span>{readTime(post.readingMinutes)}</span>
          </div>
        </div>
      </header>

      {post.coverPath && (
        <div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 md:mt-9 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-web-hairline">
            <CoverImage
              path={post.coverPath}
              alt={post.coverAlt}
              focal={post.coverFocal}
              aspect="aspect-video lg:aspect-[21/9]"
              sizes="(min-width: 1280px) 1216px, 100vw"
              width={1680}
              height={720}
              priority
            />
          </div>
        </div>
      )}

      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,680px)] justify-center gap-12 px-4 pt-10 sm:px-6 md:pt-12 lg:px-8 xl:grid-cols-[220px_minmax(0,680px)_220px]">
        {toc.length >= 2 ? <PostToc items={toc} variant="rail" /> : <div className="hidden xl:block" aria-hidden="true" />}
        <article id="post-article" className="min-w-0">
          <div className="mb-8 xl:hidden empty:hidden">
            <PostToc items={toc} variant="inline" />
          </div>
          <Prose doc={post.content} slug={post.slug} />
        </article>
        <div className="sticky top-24 hidden self-start xl:block">
          <ShareRow url={url} title={post.title} slug={post.slug} variant="rail" />
        </div>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-[680px] gap-6 px-4 sm:px-0 md:mt-12">
        <ShareRow url={url} title={post.title} slug={post.slug} />
        <Helpful slug={post.slug} />
        {post.authors.map((a) => (
          <div key={a.id} className="flex gap-[18px] rounded-xl border border-web-hairline bg-web-plate p-6">
            <Avatar author={a} size={64} />
            <div className="min-w-0">
              <b className="block font-display text-base font-bold leading-[22px] text-web-ink">{a.name}</b>
              <span className="text-[13px] font-medium leading-[18px] text-web-meta">{[a.title, a.location].filter(Boolean).join(" · ")}</span>
              {richPlain(a.bio) && <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-web-body">{richPlain(a.bio)}</p>}
              <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 text-sm font-semibold leading-5 text-web-link">
                <Link href={authorPath(a.slug)} className="hover:underline">All posts by {a.name.split(" ")[0]}</Link>
                {a.xUrl && <a href={a.xUrl} target="_blank" rel="me noopener" className="hover:underline">X</a>}
                {a.linkedinUrl && <a href={a.linkedinUrl} target="_blank" rel="me noopener" className="hover:underline">LinkedIn</a>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {related.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 lg:px-8" aria-labelledby="related-reading">
          <h2 id="related-reading" className="mb-3 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-web-meta after:h-px after:flex-1 after:bg-web-hairline">
            Related reading
          </h2>
          <div className="grid gap-x-7 gap-y-10 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <PostCard key={r.id} post={r} />
            ))}
          </div>
        </section>
      )}
      <CtaBand content={homeCtaBand} />
    </>
  )
}

export { markdownPath }
