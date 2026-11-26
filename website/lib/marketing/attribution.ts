/** Session attribution. The boot script and the client store share this key. */
export const SESSION_ATTR_KEY = "easner_session_attr"

/**
 * Session attribution, independent of PostHog's cookie.
 *
 * UTMs live on the landing URL. Later pages in the same visit do not, so the
 * landing values are kept for the browser session and stamped onto every event.
 * They are not written to the long-lived PostHog cookie.
 */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const
export const CLICK_ID_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "gad_source",
  "fbclid",
  "msclkid",
  "ttclid",
  "twclid",
  "li_fat_id",
  "mc_cid",
  "igshid",
  "rdt_cid",
] as const

export type UtmKey = (typeof UTM_KEYS)[number]
export type ClickIdKey = (typeof CLICK_ID_KEYS)[number]
export type SessionUtms = Partial<Record<UtmKey, string>>

const CAMPAIGN_KEYS = [...UTM_KEYS, ...CLICK_ID_KEYS] as const
const MAX_VALUE = 200

export interface SessionAttribution extends SessionUtms, Partial<Record<ClickIdKey, string>> {
  session_landing_path: string
  session_landing_url: string
  session_referrer: string
  session_referring_domain: string
  acquisition_channel: string
}

export interface VisitInput {
  search: string
  referrer: string
  href: string
  pathname: string
  previous: SessionAttribution | null
}

const AI_DOMAINS = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "copilot.microsoft.com", "claude.ai"]
const SEARCH = ["google.", "bing.com", "duckduckgo.com", "ecosia.org", "yahoo.com", "brave.com", "baidu.com", "yandex."]
const SOCIAL = [
  "x.com", "twitter.com", "t.co", "linkedin.com", "lnkd.in", "facebook.com", "instagram.com", "whatsapp.com", "wa.me",
  "reddit.com", "slack.com", "youtube.com", "tiktok.com", "threads.net", "telegram.org", "t.me",
]
const SHARE_NETWORKS = ["x", "twitter", "linkedin", "whatsapp", "facebook", "copy", "native"]

function clip(value: string | null): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, MAX_VALUE)
}

export function campaignFromSearch(search: string): Partial<Record<(typeof CAMPAIGN_KEYS)[number], string>> {
  const params = new URLSearchParams(search)
  const found: Partial<Record<(typeof CAMPAIGN_KEYS)[number], string>> = {}
  for (const key of CAMPAIGN_KEYS) {
    const value = clip(params.get(key))
    if (value) found[key] = value
  }
  return found
}

function hostOf(referrer: string): string {
  if (!referrer) return ""
  try {
    return new URL(referrer).hostname.replace(/^www\./, "")
  } catch {
    return referrer.slice(0, MAX_VALUE)
  }
}

export function isSameSiteHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "")
  return host === "" || host === "localhost" || host === "easner.com" || host.endsWith(".easner.com")
}

function matches(domain: string, list: string[]): boolean {
  return list.some((entry) => (entry.endsWith(".") ? domain.includes(entry) : domain === entry || domain.endsWith(`.${entry}`)))
}

/** Same channel names the admin rollup uses, so event properties and the dashboard agree. */
export function acquisitionChannel(referringDomain: string, utmSource?: string, utmMedium?: string): string {
  const medium = (utmMedium ?? "").toLowerCase()
  const source = (utmSource ?? "").toLowerCase()
  const domain = referringDomain.toLowerCase().replace(/^www\./, "")

  if (medium === "email" || source === "dispatch" || source === "newsletter" || source === "mailchimp") return "email"
  if (["cpc", "ppc", "paid", "paidsocial", "paid_social", "display"].includes(medium)) return "paid"
  if (medium === "share" || medium === "social" || (source && SHARE_NETWORKS.includes(source) && medium !== "")) return "social"
  if (AI_DOMAINS.some((entry) => source === entry.split(".")[0]) || matches(domain, AI_DOMAINS)) return "ai"
  if (domain && domain !== "$direct") {
    if (matches(domain, SEARCH)) return "search"
    if (matches(domain, SOCIAL)) return "social"
    return "referral"
  }
  if (source) return "referral"
  return "direct"
}

/** Fill source and medium when an ad click id arrived without UTMs, so the rollup can see paid traffic. */
function withClickIdUtms(campaign: Partial<Record<(typeof CAMPAIGN_KEYS)[number], string>>): Partial<Record<(typeof CAMPAIGN_KEYS)[number], string>> {
  if (campaign.utm_source || campaign.utm_medium) return campaign
  const next = { ...campaign }
  if (next.gclid || next.gbraid || next.wbraid || next.gad_source) {
    next.utm_source = "google"
    next.utm_medium = "cpc"
  } else if (next.msclkid) {
    next.utm_source = "bing"
    next.utm_medium = "cpc"
  } else if (next.fbclid) {
    next.utm_source = "facebook"
    next.utm_medium = "paid_social"
  } else if (next.ttclid) {
    next.utm_source = "tiktok"
    next.utm_medium = "paid_social"
  } else if (next.twclid) {
    next.utm_source = "twitter"
    next.utm_medium = "paid_social"
  } else if (next.li_fat_id) {
    next.utm_source = "linkedin"
    next.utm_medium = "paid_social"
  } else if (next.rdt_cid) {
    next.utm_source = "reddit"
    next.utm_medium = "paid_social"
  } else if (next.mc_cid) {
    next.utm_source = "mailchimp"
    next.utm_medium = "email"
  } else if (next.igshid) {
    next.utm_source = "instagram"
    next.utm_medium = "social"
  }
  return next
}

export function attributionFromVisit(visit: VisitInput): SessionAttribution {
  const incoming = campaignFromSearch(visit.search)
  const hasCampaign = Object.keys(incoming).length > 0
  const previous = visit.previous

  const referrerHost = hostOf(visit.referrer)
  const external = !isSameSiteHost(referrerHost)
  const landing = previous
    ? {
        session_landing_path: previous.session_landing_path,
        session_landing_url: previous.session_landing_url,
        session_referrer: previous.session_referrer,
        session_referring_domain: previous.session_referring_domain,
      }
    : {
        session_landing_path: visit.pathname || "/",
        session_landing_url: visit.href,
        session_referrer: external ? visit.referrer : "$direct",
        session_referring_domain: external ? referrerHost : "$direct",
      }

  const carried: Partial<Record<(typeof CAMPAIGN_KEYS)[number], string>> = {}
  if (hasCampaign) {
    Object.assign(carried, withClickIdUtms(incoming))
  } else if (previous) {
    for (const key of CAMPAIGN_KEYS) {
      const value = previous[key]
      if (value) carried[key] = value
    }
  }

  return {
    ...landing,
    ...carried,
    acquisition_channel: acquisitionChannel(landing.session_referring_domain, carried.utm_source, carried.utm_medium),
  }
}

export function attributionProperties(attribution: SessionAttribution): Record<string, string> {
  const properties: Record<string, string> = {
    session_landing_path: attribution.session_landing_path,
    session_landing_url: attribution.session_landing_url,
    session_referrer: attribution.session_referrer,
    session_referring_domain: attribution.session_referring_domain,
    acquisition_channel: attribution.acquisition_channel,
  }
  for (const key of CAMPAIGN_KEYS) {
    const value = attribution[key]
    if (value) properties[key] = value
  }
  return properties
}

/**
 * Runs before hydration so a click that navigates away still leaves the landing
 * UTMs in sessionStorage. Skips storage until analytics consent allows it.
 */
export function attributionBootScript(): string {
  return `(function(){try{var KEY=${JSON.stringify(SESSION_ATTR_KEY)};var KEYS=${JSON.stringify([...UTM_KEYS, ...CLICK_ID_KEYS])};var params=new URLSearchParams(location.search);var found={};for(var i=0;i<KEYS.length;i++){var v=params.get(KEYS[i]);if(v)found[KEYS[i]]=v.trim().slice(0,200)}var host="";var ref=document.referrer||"";try{host=new URL(ref).hostname.replace(/^www\\./,"")}catch(e){}var same=!host||host==="localhost"||host==="easner.com"||host.slice(-11)===".easner.com";var landing={session_landing_path:location.pathname||"/",session_landing_url:location.href,session_referrer:same?"$direct":ref,session_referring_domain:same?"$direct":host};var cookie=document.cookie;var region=new RegExp("(?:^|; )easner_region=([^;]*)").exec(cookie);var consent=new RegExp("(?:^|; )easner_analytics_consent=([^;]*)").exec(cookie);var canStore=(region&&decodeURIComponent(region[1])==="open")||(consent&&decodeURIComponent(consent[1])==="granted");var prev=null;if(canStore){try{prev=JSON.parse(sessionStorage.getItem(KEY)||"null")}catch(e){}}else if(window.__easnerAttr){prev=window.__easnerAttr}var next={};if(prev&&prev.session_landing_path){next.session_landing_path=prev.session_landing_path;next.session_landing_url=prev.session_landing_url;next.session_referrer=prev.session_referrer;next.session_referring_domain=prev.session_referring_domain}else{next.session_landing_path=landing.session_landing_path;next.session_landing_url=landing.session_landing_url;next.session_referrer=landing.session_referrer;next.session_referring_domain=landing.session_referring_domain}var has=false;for(var k in found){if(Object.prototype.hasOwnProperty.call(found,k))has=true}if(has){for(var j=0;j<KEYS.length;j++)delete next[KEYS[j]];for(var k2 in found)next[k2]=found[k2]}else if(prev){for(var n=0;n<KEYS.length;n++){if(prev[KEYS[n]])next[KEYS[n]]=prev[KEYS[n]]}}window.__easnerAttr=next;if(canStore)sessionStorage.setItem(KEY,JSON.stringify(next))}catch(e){}})();`
}

export function utmsOf(attribution: Partial<SessionAttribution> | null): SessionUtms {
  if (!attribution) return {}
  const utms: SessionUtms = {}
  for (const key of UTM_KEYS) {
    const value = attribution[key]
    if (value) utms[key] = value
  }
  return utms
}
