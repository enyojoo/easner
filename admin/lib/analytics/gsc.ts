/**
 * Search Console adapter. A service account (added as a user on the property) signs a JWT, trades it for an access
 * token and reads the Search Analytics API. Only the network functions need `fetch`; `parseGscRows` is pure.
 * Data trails by about three days, so the job asks for days at least `GSC_LAG_DAYS` old.
 */
import { createSign } from "node:crypto"
import { normalizePath } from "./paths.ts"
import type { GscRow } from "./types.ts"

export const GSC_LAG_DAYS = 3
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"

export type GscFetcher = (day: string) => Promise<GscRow[]>

export interface GscConfig {
  siteUrl: string
  serviceAccountJson: string
}

interface ServiceAccount {
  client_email: string
  private_key: string
  token_uri?: string
}

export function parseServiceAccount(json: string): ServiceAccount {
  let parsed: Partial<ServiceAccount>
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error("GSC_SERVICE_ACCOUNT_JSON is not valid JSON")
  }
  if (!parsed.client_email || !parsed.private_key) throw new Error("GSC_SERVICE_ACCOUNT_JSON needs client_email and private_key")
  return { client_email: parsed.client_email, private_key: parsed.private_key.replace(/\\n/g, "\n"), token_uri: parsed.token_uri }
}

const b64url = (value: string | Buffer) => Buffer.from(value).toString("base64url")

export function signServiceAccountJwt(account: ServiceAccount, nowSeconds: number): string {
  const audience = account.token_uri ?? "https://oauth2.googleapis.com/token"
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claims = b64url(JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: audience, iat: nowSeconds, exp: nowSeconds + 3000 }))
  const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(account.private_key)
  return `${header}.${claims}.${b64url(signature)}`
}

export function parseGscRows(body: { rows?: Array<{ keys?: string[]; clicks?: number; impressions?: number; position?: number }> }): GscRow[] {
  const out: GscRow[] = []
  for (const row of body.rows ?? []) {
    const [page, query] = row.keys ?? []
    if (!page || !query) continue
    out.push({
      path: normalizePath(page),
      query,
      impressions: Math.round(row.impressions ?? 0),
      clicks: Math.round(row.clicks ?? 0),
      position: Math.round((row.position ?? 0) * 100) / 100,
    })
  }
  return out
}

export function createGscFetcher(config: GscConfig, fetchImpl: typeof fetch = fetch, now: () => number = Date.now): GscFetcher {
  const account = parseServiceAccount(config.serviceAccountJson)
  let token: { value: string; expires: number } | null = null

  async function accessToken(): Promise<string> {
    if (token && token.expires > now()) return token.value
    const assertion = signServiceAccountJwt(account, Math.floor(now() / 1000))
    const response = await fetchImpl(account.token_uri ?? "https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok) throw new Error(`Google token ${response.status}`)
    const body = (await response.json()) as { access_token?: string; expires_in?: number }
    if (!body.access_token) throw new Error("Google token response had no access_token")
    token = { value: body.access_token, expires: now() + (body.expires_in ?? 3600) * 1000 - 60_000 }
    return token.value
  }

  return async (day) => {
    const response = await fetchImpl(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${await accessToken()}` },
      body: JSON.stringify({ startDate: day, endDate: day, dimensions: ["page", "query"], rowLimit: 25000, dataState: "final" }),
      signal: AbortSignal.timeout(60_000),
    })
    if (!response.ok) throw new Error(`Search Console ${response.status}`)
    return parseGscRows(await response.json())
  }
}
