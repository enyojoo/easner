import { getAllPosts, getCategories, getPost } from "./queries"
import { postToMarkdown } from "./markdown"
import { abs, markdownPath, postPath } from "./urls"

const LIMIT = 50

/** Newest indexable posts (a `noindex` post is not offered to crawlers of any kind). */
async function newestPosts() {
  return (await getAllPosts()).filter((p) => !p.noindex).slice(0, LIMIT)
}

/** The `## Blog` section of /llms.txt: newest ~50 posts, grouped by category, one line each. */
export async function blogLlmsSection(): Promise<string[]> {
  const [posts, categories] = await Promise.all([newestPosts(), getCategories()])
  if (posts.length === 0) return []
  const lines = [
    "## Blog",
    "",
    `Guides, product updates and explainers from the Easner team. Every post is also available as Markdown at ${abs("/blog/<slug>.md")}; the feed is ${abs("/blog/feed.xml")}; full text is in ${abs("/llms-full.txt")}.`,
    "",
  ]
  for (const category of categories) {
    const mine = posts.filter((p) => p.categoryId === category.id)
    if (!mine.length) continue
    lines.push(`### ${category.name}`, "")
    for (const post of mine) {
      const summary = (post.summary ?? post.excerpt).replace(/\s+/g, " ").trim()
      lines.push(`- [${post.title}](${abs(postPath(post.slug))}): ${summary}`)
    }
    lines.push("")
  }
  return lines
}

/** The `## Blog` section of /llms-full.txt: the same posts with their full Markdown bodies. */
export async function blogLlmsFullSection(): Promise<string[]> {
  const posts = await newestPosts()
  if (posts.length === 0) return []
  const bodies = await Promise.all(posts.map((p) => getPost(p.slug)))
  const out = ["## Blog posts (full text)", ""]
  for (const post of bodies) {
    if (!post) continue
    out.push(postToMarkdown(post, { url: abs(postPath(post.slug)) }), `Markdown: ${abs(markdownPath(post.slug))}`, "", "---", "")
  }
  return out
}
