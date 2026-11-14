import { analyticsEnv } from "@/lib/analytics/env"
import { isAuthorizedCron } from "@/lib/analytics/cron-auth"
import { createGscFetcher } from "@/lib/analytics/gsc"
import { isoDay } from "@/lib/analytics/paths"
import { createHogQLRunner } from "@/lib/analytics/posthog"
import { runSync } from "@/lib/analytics/sync"
import { createSupabaseStore } from "@/lib/server/analytics-store"

/**
 * Nightly analytics rollup (vercel.json cron, 02:30 UTC). Protected by CRON_SECRET: Vercel Cron sends it as a bearer
 * token. With PostHog or Search Console keys missing it does nothing for that source and says so.
 *
 *   GET /api/cron/analytics            fetch the days still missing (the last 3, or 7 on the first run)
 *   GET /api/cron/analytics?days=30    backfill up to 60 days (run it by hand, with the same bearer token)
 */
export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function GET(request: Request) {
  const env = analyticsEnv(process.env)
  if (!env.cronSecret) return Response.json({ error: "CRON_SECRET isn’t set." }, { status: 503 })
  if (!isAuthorizedCron(request.headers.get("authorization"), env.cronSecret)) {
    return Response.json({ error: "Not allowed." }, { status: 401 })
  }

  const asked = Number(new URL(request.url).searchParams.get("days"))
  const backfill = Number.isInteger(asked) && asked > 0 ? Math.min(asked, 60) : undefined

  try {
    const result = await runSync(
      {
        env,
        store: env.supabase.ok ? createSupabaseStore(env.supabase.url, env.supabase.secretKey) : null,
        posthog: env.posthog.ok ? createHogQLRunner(env.posthog) : null,
        gsc: env.gsc.ok ? createGscFetcher(env.gsc) : null,
      },
      { today: isoDay(new Date()), ...(backfill ? { window: backfill, backfill, maxPerRun: 10 } : {}) },
    )
    const failed = [result.posthog, result.gsc].some((s) => s.state === "ran" && s.days.some((d) => d.status === "error"))
    return Response.json(result, { status: failed ? 207 : 200 })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The rollup failed." }, { status: 500 })
  }
}
