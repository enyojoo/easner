/** Which analytics connections are configured. Pure: pass `process.env`. Names are documented in admin/README.md. */

export type Env = Record<string, string | undefined>

export type Connection<T> = ({ ok: true } & T) | { ok: false; missing: string[] }

export interface AnalyticsEnv {
  posthog: Connection<{ host: string; projectId: string; apiKey: string }>
  gsc: Connection<{ siteUrl: string; serviceAccountJson: string }>
  supabase: Connection<{ url: string; secretKey: string }>
  cronSecret: string | null
}

const clean = (value: string | undefined) => (value && value.trim() ? value.trim() : undefined)

/** PostHog's query API lives on the app host (us.posthog.com or eu.posthog.com), not on the ingest or proxy host. */
export const DEFAULT_POSTHOG_HOST = "https://us.posthog.com"

export function analyticsEnv(env: Env): AnalyticsEnv {
  const need = (names: string[]) => names.filter((name) => !clean(env[name]))

  const phMissing = need(["POSTHOG_PROJECT_ID", "POSTHOG_PERSONAL_API_KEY"])
  const gscMissing = need(["GSC_SITE_URL", "GSC_SERVICE_ACCOUNT_JSON"])
  const sbMissing = need(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY"])

  return {
    posthog: phMissing.length
      ? { ok: false, missing: phMissing }
      : {
          ok: true,
          host: (clean(env.POSTHOG_HOST) ?? DEFAULT_POSTHOG_HOST).replace(/\/+$/, ""),
          projectId: clean(env.POSTHOG_PROJECT_ID)!,
          apiKey: clean(env.POSTHOG_PERSONAL_API_KEY)!,
        },
    gsc: gscMissing.length
      ? { ok: false, missing: gscMissing }
      : { ok: true, siteUrl: clean(env.GSC_SITE_URL)!, serviceAccountJson: clean(env.GSC_SERVICE_ACCOUNT_JSON)! },
    supabase: sbMissing.length
      ? { ok: false, missing: sbMissing }
      : { ok: true, url: clean(env.NEXT_PUBLIC_SUPABASE_URL)!, secretKey: clean(env.SUPABASE_SECRET_KEY)! },
    cronSecret: clean(env.CRON_SECRET) ?? null,
  }
}
