import { signPreviewToken, websiteEnv } from "@/lib/blog/website-hooks"
import { verifiedClient } from "@/lib/server/blog-server"

export const dynamic = "force-dynamic"

/** A signed, 30-minute link to the website's draft view of a post (contract: packages/blog-content/README.md). */
export async function POST(request: Request) {
  const auth = await verifiedClient(request)
  if (auth instanceof Response) return auth

  const { postId } = (await request.json().catch(() => ({}))) as { postId?: string }
  if (!postId) return Response.json({ error: "Which post?" }, { status: 400 })

  // Members can read every post; a signed-in non-member sees nothing, so this also checks who is asking.
  const { data } = await auth.client.from("blog_posts").select("id").eq("id", postId).maybeSingle()
  if (!data) return Response.json({ error: "That post couldn’t be found." }, { status: 404 })

  const env = websiteEnv(process.env)
  if (!env.ok) return Response.json({ skipped: `Preview isn’t set up here: ${env.missing.join(", ")} not set.` })

  const token = signPreviewToken(postId, env.previewSecret, Math.floor(Date.now() / 1000))
  return Response.json({ url: `${env.url}/api/blog/preview?token=${encodeURIComponent(token)}` })
}
