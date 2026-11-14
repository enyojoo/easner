/** Embed URL detection for the editor: which provider a pasted address belongs to, and its thumbnail/facade info. */
import type { EmbedProvider } from "@easner/blog-content"

export interface EmbedInfo {
  provider: EmbedProvider
  url: string
  /** Video id or status id when we can tell, for the facade label. */
  id?: string
}

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"])
const X_HOSTS = new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"])

/** The provider for a URL, or null when it isn't a recognised embeddable address. */
export function detectEmbed(raw: string): EmbedInfo | null {
  const text = raw.trim()
  if (!/^https?:\/\/\S+$/.test(text)) return null
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  const parts = url.pathname.split("/").filter(Boolean)

  if (host === "youtu.be" && parts[0]) return { provider: "youtube", url: text, id: parts[0] }
  if (YOUTUBE_HOSTS.has(host)) {
    const id = url.searchParams.get("v") ?? (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : undefined)
    if (id) return { provider: "youtube", url: text, id }
    return null
  }
  if (host === "vimeo.com" || host === "www.vimeo.com") {
    const id = parts.find((part) => /^\d+$/.test(part))
    if (id) return { provider: "vimeo", url: text, id }
    return null
  }
  if (host === "loom.com" || host === "www.loom.com") {
    if (["share", "embed"].includes(parts[0]) && parts[1]) return { provider: "loom", url: text, id: parts[1] }
    return null
  }
  if (X_HOSTS.has(host)) {
    const at = parts.indexOf("status")
    if (at > 0 && parts[at + 1]) return { provider: "x", url: text, id: parts[at + 1] }
    return null
  }
  return null
}

export const PROVIDER_LABEL: Record<EmbedProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  loom: "Loom",
  x: "X post",
  other: "Embed",
}
