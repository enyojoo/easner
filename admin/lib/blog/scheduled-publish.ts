import { timingSafeEqual } from "node:crypto"
import type { DocNode } from "@easner/blog-content"
import { prepareSave, type DerivedFields } from "./derive.ts"

/**
 * The scheduled publish job, with every side effect passed in so it can be tested: the cron route wires it to the
 * secret-key Supabase client and the website hooks. It publishes through `publish_post`, which only accepts a post
 * that is scheduled and due, so running it twice (or two runs overlapping) publishes each post once.
 */
export type WebsiteNote = { status: "ok" | "skipped" | "failed"; note?: string }

export interface DueDeps {
  /** Posts with status scheduled and scheduled_for in the past. */
  listDue(): Promise<Array<{ id: string; slug: string }>>
  loadDoc(id: string): Promise<DocNode | null>
  publish(id: string, derived: DerivedFields): Promise<{ ok: true } | { ok: false; code?: string; message: string }>
  /** Revalidate the website and ping IndexNow, exactly as a manual publish does. Never throws. */
  notify(id: string): Promise<WebsiteNote>
}

export type DueResult = {
  due: number
  published: Array<{ id: string; slug: string; website: WebsiteNote }>
  skipped: Array<{ id: string; slug: string; reason: string }>
  failed: Array<{ id: string; slug: string; message: string }>
}

/** The database answers "This post isn't due." (check_violation) when another run got there first. */
const alreadyDone = (code: string | undefined, message: string) => code === "23514" && /isn.t due/i.test(message)

export async function publishDue(deps: DueDeps, limit = 25): Promise<DueResult> {
  const rows = (await deps.listDue()).slice(0, limit)
  const result: DueResult = { due: rows.length, published: [], skipped: [], failed: [] }
  for (const row of rows) {
    try {
      const doc = await deps.loadDoc(row.id)
      if (!doc) {
        result.failed.push({ ...row, message: "The post has no content." })
        continue
      }
      const prepared = prepareSave({ doc })
      if (!prepared.ok) {
        result.failed.push({ ...row, message: `Invalid content: ${prepared.errors[0]?.message ?? "a block is invalid"}` })
        continue
      }
      const outcome = await deps.publish(row.id, prepared.derived)
      if (outcome.ok) {
        result.published.push({ ...row, website: await deps.notify(row.id) })
      } else if (alreadyDone(outcome.code, outcome.message)) {
        result.skipped.push({ ...row, reason: "Already published or not due." })
      } else {
        result.failed.push({ ...row, message: outcome.message })
      }
    } catch (error) {
      result.failed.push({ ...row, message: error instanceof Error ? error.message : "Unexpected error." })
    }
  }
  return result
}

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Constant time, and an unset secret never matches. */
export function isCronAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || !header) return false
  const match = /^Bearer (.+)$/.exec(header)
  if (!match) return false
  const given = Buffer.from(match[1])
  const expected = Buffer.from(secret)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
