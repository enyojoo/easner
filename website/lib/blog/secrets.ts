import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

/** Constant-time string comparison. Unequal lengths are rejected without comparing. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

const b64url = (input: Buffer | string) => Buffer.from(input).toString("base64url")

export interface PreviewPayload {
  postId: string
  /** Unix seconds. */
  exp: number
}

/**
 * Preview tokens, as in packages/blog-content/README.md: `base64url(JSON payload) + "." + base64url(HMAC_SHA256)`.
 * Returns the payload when the signature matches (constant-time) and the token has not expired.
 */
export function verifyPreviewToken(token: string, secret: string, now = Date.now() / 1000): PreviewPayload | null {
  const [payload, signature, ...extra] = token.split(".")
  if (!payload || !signature || extra.length) return null
  const expected = b64url(createHmac("sha256", secret).update(payload).digest())
  if (!safeEqual(signature, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<PreviewPayload>
    if (typeof data.postId !== "string" || typeof data.exp !== "number" || data.exp <= now) return null
    return { postId: data.postId, exp: data.exp }
  } catch {
    return null
  }
}

/** The signing half, used by tests and by anything that needs to mint a token for local checks. */
export function signPreviewToken(payload: PreviewPayload, secret: string): string {
  const body = b64url(JSON.stringify(payload))
  return `${body}.${b64url(createHmac("sha256", secret).update(body).digest())}`
}
