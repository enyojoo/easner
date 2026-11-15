import { notFound } from "next/navigation"
import { MapPin } from "lucide-react"
import { CtaBand } from "@/components/marketing/cta-band"
import { homeCtaBand } from "@/lib/marketing/content/home"
import { joinNames, pluralPosts } from "@/lib/blog/format"
import { getAuthor, getPostsByAuthor, paginate } from "@/lib/blog/queries"
import { authorMeta, richPlain } from "@/lib/blog/seo-text"
import { authorPath, pagePath, postPath, abs } from "@/lib/blog/urls"
import { breadcrumbJsonLd, collectionPageJsonLd, profilePageJsonLd } from "@/lib/marketing/structured-data"
import { Avatar } from "./avatar"
import { Breadcrumb } from "./breadcrumb"
import { AuthorSocials } from "./author-socials"
import { JsonLd } from "./json-ld"
import { Pagination } from "./pagination"
import { PostGrid } from "./post-card"
import { RichText } from "./prose"

const PILL =
  "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium text-web-ink shadow-[inset_0_0_0_1px_var(--web-hairline)] transition-colors hover:text-primary-text"

export function authorSameAs(a: { xUrl: string | null; linkedinUrl: string | null; githubUrl: string | null; websiteUrl: string | null }) {
  return [a.xUrl, a.linkedinUrl, a.githubUrl, a.websiteUrl].filter((u): u is string => Boolean(u))
}

/** An author page (page 1 and `?page=N`): photo, name, role, bio, socials, stats line, their posts. No email address. */
export async function AuthorView({ slug, page }: { slug: string; page: number }) {
  const author = await getAuthor(slug)
  if (!author) notFound()
  const posts = await getPostsByAuthor(author.id)
  const paged = paginate(posts, page)
  if (page > 1 && page !== paged.page) notFound()
  const base = authorPath(slug)
  const path = pagePath(base, page)
  const meta = authorMeta(author, page)
  const first = author.name.split(" ")[0]
  const topics = author.topCategories.slice(0, 2).map((c) => c.name)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: "Authors", path: "/blog/authors" },
            { name: author.name, path },
          ]),
          profilePageJsonLd({
            name: author.name,
            path: base,
            jobTitle: author.title,
            image: author.avatarPath ? abs(`${base}/photo`) : undefined,
            sameAs: authorSameAs(author),
            description: richPlain(author.bio) || meta.description,
          }),
          collectionPageJsonLd({
            name: `Posts by ${author.name}`,
            description: meta.description,
            path,
            items: paged.items.map((p) => ({ name: p.title, path: postPath(p.slug) })),
          }),
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 md:pt-10 lg:px-8">
        <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: "Authors", href: "/blog/authors" }, { label: author.name }]} />
      </div>
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pt-8 sm:px-6 md:grid-cols-[auto_1fr] md:gap-8 md:pt-10 lg:px-8">
        <Avatar author={author} size={128} />
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-bold uppercase leading-9 text-web-ink sm:text-[40px] sm:leading-[48px]">{author.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-base font-medium leading-6 text-web-body">
            {author.title && <span>{author.title}</span>}
            {author.title && author.location && <span aria-hidden="true" className="size-[3px] rounded-full bg-web-meta" />}
            {author.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" /> {author.location}
              </span>
            )}
          </div>
          <div className="mt-3.5 grid max-w-2xl gap-3 text-[17px] leading-7 text-web-body [&_a]:text-web-link [&_a]:underline">
            <RichText value={author.bio} />
          </div>
          {authorSameAs(author).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <AuthorSocials author={author} labels linkClassName={PILL} />
            </div>
          )}
          <p className="mt-4 text-sm font-medium text-web-meta">
            {pluralPosts(author.postCount)}
            {topics.length > 0 && ` · Writing about ${joinNames(topics)}`}
          </p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-web-meta after:h-px after:flex-1 after:bg-web-hairline">
          Posts by {first}
        </h2>
        {author.postCount === 0 ? (
          <p className="text-[17px] leading-7 text-web-body">{first} hasn’t published a post yet. Check back soon.</p>
        ) : (
          <>
            <PostGrid posts={paged.items} />
            <Pagination base={base} page={paged.page} pageCount={paged.pageCount} />
          </>
        )}
      </section>
      <CtaBand content={homeCtaBand} />
    </>
  )
}
