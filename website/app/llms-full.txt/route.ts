import { blogLlmsFullSection } from "@/lib/blog/llms"
import { buildLlmsTxt } from "@/lib/marketing/llms-txt"

/** /llms-full.txt: everything in /llms.txt plus the full text of the newest blog posts, as Markdown. */
export const revalidate = 3600

export async function GET() {
  const blog = await blogLlmsFullSection()
  return new Response(buildLlmsTxt(blog), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
