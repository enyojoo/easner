import { analyticsEnv } from "@/lib/analytics/env"
import { verifiedClient } from "@/lib/server/blog-server"

/** Which analytics sources are connected, for the "Connect PostHog" state. Signed-in members only; never returns a key. */
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const auth = await verifiedClient(request)
  if (auth instanceof Response) return auth
  const { data: member } = await auth.client.from("admin_members").select("user_id").eq("user_id", auth.userId).maybeSingle()
  if (!member) return Response.json({ error: "Not allowed." }, { status: 403 })

  const env = analyticsEnv(process.env)
  return Response.json({
    posthog: env.posthog.ok ? { connected: true } : { connected: false, missing: env.posthog.missing },
    gsc: env.gsc.ok ? { connected: true } : { connected: false, missing: env.gsc.missing },
    cron: { secret: Boolean(env.cronSecret), writer: env.supabase.ok },
  })
}
