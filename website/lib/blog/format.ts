const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

/** "Nov 12, 2026". UTC so the server and the browser always agree. */
export function formatDate(iso: string): string {
  return DATE.format(new Date(iso))
}

export function readTime(minutes: number): string {
  return `${minutes} min read`
}

export function initials(name: string): string {
  const parts = name.replace(/^guest:\s*/i, "").trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

const TINTS = ["navy", "primary", "slate", "emerald"] as const
export function avatarTint(seed: string): (typeof TINTS)[number] {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TINTS[h % TINTS.length]
}

/** "Global money and Personal", "Business, Personal and Company". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("")
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

export function pluralPosts(count: number): string {
  return `${count} ${count === 1 ? "post" : "posts"}`
}
