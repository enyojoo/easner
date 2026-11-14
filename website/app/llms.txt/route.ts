import { buildLlmsTxt } from "@/lib/marketing/llms-txt"
import { blogLlmsSection } from "@/lib/blog/llms"

/**
 * /llms.txt: the site summarised for large language models and AI agents (llmstxt.org). Static, refreshed hourly and
 * whenever the blog is revalidated (the blog section reads tagged fetches).
 */
export const revalidate = 3600

export async function GET() {
  return new Response(buildLlmsTxt(await blogLlmsSection()), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
