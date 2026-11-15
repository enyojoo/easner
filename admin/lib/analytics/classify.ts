import type { Channel } from "./types.ts"

/** Referrer domains grouped as "AI answers" (plan §4: AEO is a goal, so these are not lumped into Referral). */
export const AI_DOMAINS = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "copilot.microsoft.com", "claude.ai"]
const SEARCH = ["google.", "bing.com", "duckduckgo.com", "ecosia.org", "yahoo.com", "brave.com", "baidu.com", "yandex."]
const SOCIAL = [
  "x.com", "twitter.com", "t.co", "linkedin.com", "lnkd.in", "facebook.com", "instagram.com", "whatsapp.com", "wa.me",
  "reddit.com", "slack.com", "youtube.com", "tiktok.com", "threads.net", "telegram.org", "t.me",
]
const SHARE_NETWORKS = ["x", "twitter", "linkedin", "whatsapp", "facebook", "copy", "native"]

const matches = (domain: string, list: string[]) =>
  list.some((entry) => (entry.endsWith(".") ? domain.includes(entry) : domain === entry || domain.endsWith(`.${entry}`)))

export function isAiDomain(domain: string): boolean {
  return matches(domain.toLowerCase(), AI_DOMAINS)
}

/** One visit's channel from its referring domain and UTMs. UTMs win over the referrer. */
export function classifySource(referringDomain: string | null | undefined, utmSource?: string | null, utmMedium?: string | null): Channel {
  const medium = (utmMedium ?? "").toLowerCase()
  const source = (utmSource ?? "").toLowerCase()
  const domain = (referringDomain ?? "").toLowerCase().replace(/^www\./, "")

  if (medium === "email" || source === "dispatch" || source === "newsletter") return "email"
  if (["cpc", "ppc", "paid", "paidsocial", "paid_social", "display"].includes(medium)) return "paid"
  if (medium === "share" || medium === "social" || (source && SHARE_NETWORKS.includes(source) && medium !== "")) return "social"
  if (AI_DOMAINS.some((d) => source === d.split(".")[0]) || matches(domain, AI_DOMAINS)) return "ai"
  if (domain && domain !== "$direct") {
    if (matches(domain, SEARCH)) return "search"
    if (matches(domain, SOCIAL)) return "social"
    return "referral"
  }
  if (source) return "referral"
  return "direct"
}

export const CHANNEL_LABELS: Record<Channel, string> = {
  search: "Google and search",
  ai: "AI answers",
  social: "Social",
  email: "Email",
  paid: "Paid",
  referral: "Referral",
  direct: "Direct",
}
