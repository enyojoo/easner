import { getPublishedPosts } from "@/lib/blog-service"

const BASE_URL = "https://www.easner.com"

export async function GET() {
  const posts = await getPublishedPosts({ limit: 50 })
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Easner Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Insights on the future of banking. The latest updates on Easner, the world of stablecoins and finance.</description>
    <atom:link href="${BASE_URL}/blog/feed" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt || post.title)}</description>
      <pubDate>${post.published_at ? new Date(post.published_at).toUTCString() : ""}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
    </item>`
      )
      .join("")}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
