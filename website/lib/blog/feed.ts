import { docToHtml } from "./html"
import { getPost } from "./queries"
import { abs, cropImageUrl, postPath } from "./urls"
import type { BlogPostSummary } from "./types"

const ITEMS = 20
const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const cdata = (v: string) => `<![CDATA[${v.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`
const rfc822 = (iso: string) => new Date(iso).toUTCString()

/** An RSS 2.0 feed with full post content (`content:encoded`), newest 20 posts. */
export async function buildFeed({
  title,
  description,
  path,
  posts,
}: {
  title: string
  description: string
  /** The page the feed belongs to, e.g. /blog or /blog/categories/business. */
  path: string
  posts: BlogPostSummary[]
}): Promise<string> {
  const newest = posts.filter((p) => !p.noindex).slice(0, ITEMS)
  const bodies = await Promise.all(newest.map((p) => getPost(p.slug)))
  const built = newest.map((summary, i) => ({ summary, body: bodies[i] })).filter((x) => x.body)
  const updated = built.reduce((max, { summary }) => {
    const d = summary.contentModifiedAt ?? summary.publishedAt
    return d > max ? d : max
  }, built[0]?.summary.publishedAt ?? new Date(0).toISOString())

  const items = built
    .map(({ summary: p, body }) => {
      const url = abs(postPath(p.slug))
      const image = cropImageUrl(p, "16x9")
      return [
        "    <item>",
        `      <title>${esc(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(p.publishedAt)}</pubDate>`,
        `      <category>${esc(p.category.name)}</category>`,
        ...p.authors.map((a) => `      <dc:creator>${esc(a.name)}</dc:creator>`),
        `      <description>${esc(p.excerpt)}</description>`,
        ...(image ? [`      <media:content url="${image}" medium="image" type="image/jpeg" width="1600" height="900"/>`] : []),
        `      <content:encoded>${cdata(docToHtml(body!.content))}</content:encoded>`,
        "    </item>",
      ].join("\n")
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(title)}</title>
    <link>${abs(path)}</link>
    <description>${esc(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${rfc822(updated)}</lastBuildDate>
    <atom:link href="${abs(`${path === "/blog" ? "/blog" : path}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
}

export function feedResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
