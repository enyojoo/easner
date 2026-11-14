import { timingSafeEqual } from "node:crypto"

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Constant-time compare; no secret configured means nobody is let in. */
export function isAuthorizedCron(header: string | null, secret: string | null): boolean {
  if (!secret || !header) return false
  const match = /^Bearer (.+)$/i.exec(header)
  if (!match) return false
  const a = Buffer.from(match[1])
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}
