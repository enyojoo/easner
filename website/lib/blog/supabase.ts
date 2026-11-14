import "server-only"

/**
 * A minimal PostgREST client for the website Supabase project. The public blog reads with the anon key under
 * row-level security and **explicit column lists** (supabase/README.md): `select=*` would name columns anon may not
 * read and fail the whole request. Plain `fetch` keeps every read in Next's data cache so it can carry revalidation
 * tags. The service role is used only for draft preview and the feedback route, never by a page that renders live
 * posts.
 */

export type Role = "anon" | "service"

interface Options {
  role?: Role
  tags?: string[]
  /** Seconds. Defaults to the blog's hourly fallback; tags are the real invalidation. */
  revalidate?: number
  /** Skip the data cache (draft preview). */
  noStore?: boolean
  method?: "GET" | "POST" | "PATCH"
  body?: unknown
  prefer?: string
}

function credentials(role: Role) {
  const url = process.env.SUPABASE_URL
  const key = role === "service" ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error(`Supabase ${role} credentials are not configured`)
  return { url: url.replace(/\/$/, ""), key }
}

export async function rest<T>(table: string, query: string, options: Options = {}): Promise<T> {
  const { role = "anon", tags, revalidate = 3600, noStore, method = "GET", body, prefer } = options
  const { url, key } = credentials(role)
  const headers: Record<string, string> = { apikey: key, Accept: "application/json" }
  // Legacy anon / service_role keys are JWTs and go in Authorization too. The newer sb_publishable_ / sb_secret_ keys
  // are not JWTs and travel in `apikey` alone.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (prefer) headers.Prefer = prefer
  const response = await fetch(`${url}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(noStore || method !== "GET" ? { cache: "no-store" as const } : { next: { revalidate, tags } }),
  })
  if (!response.ok) {
    throw new Error(`Supabase ${table} ${method} failed: ${response.status} ${(await response.text()).slice(0, 300)}`)
  }
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** Public URL of an object in the `blog` storage bucket. */
export function storageUrl(path: string): string {
  const base = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "")
  return `${base}/storage/v1/object/public/blog/${path.replace(/^\/+/, "")}`
}
