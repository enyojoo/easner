/** A page path without query, hash or trailing slash. Empty and non-path input become "/". */
export function normalizePath(input: string | null | undefined): string {
  if (!input) return "/"
  let path = input.trim()
  try {
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname
  } catch {
    return "/"
  }
  path = path.split(/[?#]/)[0] || "/"
  if (!path.startsWith("/")) path = `/${path}`
  path = path.replace(/\/{2,}/g, "/")
  return path.length > 1 ? path.replace(/\/+$/, "") : path
}

/** The slug when `path` is a single blog post URL (/blog/some-slug). */
export function postSlugFromPath(path: string): string | null {
  const match = /^\/blog\/([^/]+)$/.exec(normalizePath(path))
  return match ? decodeURIComponent(match[1]) : null
}

/** yyyy-mm-dd, in UTC. */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return isoDay(d)
}
