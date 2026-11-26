import {
  blogPostSlug,
  captureCtaClicked,
  captureFormSubmitted,
  captureScrollDepth,
  inferDestinationType,
  wasClickJustTracked,
  wasFormJustTracked,
} from "@/lib/marketing/analytics"

const SCROLL_DEPTHS = [25, 50, 75, 100] as const

let installed = false
const scrollSent = new Map<string, Set<number>>()

function locationFor(el: Element, href: string): string {
  const marked = el.closest("[data-cta-location]")?.getAttribute("data-cta-location")
  if (marked) return marked
  if (href) {
    try {
      const path = new URL(href, window.location.origin).pathname
      if (/^\/blog\/[^/]+$/.test(path)) return "blog_post"
      if (path.startsWith("/blog")) return "blog_link"
      if (path.startsWith("/legal") || path.startsWith("/privacy") || path.startsWith("/terms")) return "legal_link"
    } catch {
      // Keep the generic location when the href is not a URL.
    }
  }
  if (el.closest("header")) return "header_click"
  if (el.closest("footer")) return "footer_click"
  if (el.closest("nav")) return "nav_click"
  return "site_click"
}

function labelOf(el: Element): string {
  const labelled = el.getAttribute("aria-label") || el.textContent || ""
  return labelled.replace(/\s+/g, " ").trim().slice(0, 120)
}

function destinationOf(el: Element): { href: string; external: boolean } {
  if (el instanceof HTMLAnchorElement && el.href) {
    try {
      const url = new URL(el.href)
      return { href: url.href, external: url.origin !== window.location.origin }
    } catch {
      return { href: el.getAttribute("href") ?? "", external: false }
    }
  }
  return { href: "", external: false }
}

function onClick(event: MouseEvent) {
  if (wasClickJustTracked()) return
  if (event.button !== 0) return
  const target = event.target
  if (!(target instanceof Element)) return
  const el = target.closest("a, button")
  if (!el || el.closest("[data-analytics-ignore]")) return

  const { href, external } = destinationOf(el)
  const label = labelOf(el)
  if (!label && !href) return

  captureCtaClicked({
    cta_location: locationFor(el, href),
    cta_label: label || undefined,
    destination: href || "button",
    destination_type: href ? inferDestinationType(href, { external }) : "internal",
  })
}

function onSubmit(event: Event) {
  if (wasFormJustTracked()) return
  const form = event.target
  if (!(form instanceof HTMLFormElement)) return
  const formName = form.getAttribute("name") || form.id || form.getAttribute("action") || "form"
  captureFormSubmitted(formName)
}

function onScroll() {
  const pathname = window.location.pathname
  if (blogPostSlug(pathname)) return
  const sent = scrollSent.get(pathname) ?? new Set<number>()
  scrollSent.set(pathname, sent)
  const scrolling = document.documentElement
  const total = scrolling.scrollHeight - window.innerHeight
  const pct = total <= 0 ? 100 : Math.round((window.scrollY / total) * 100)
  for (const depth of SCROLL_DEPTHS) {
    if (pct >= depth && !sent.has(depth)) {
      sent.add(depth)
      captureScrollDepth(depth)
    }
  }
}

/** Clicks, form submits, and scroll depth that individual components do not already report. */
export function installBehaviorTracking() {
  if (installed || typeof window === "undefined") return
  installed = true
  document.addEventListener("click", onClick)
  document.addEventListener("submit", onSubmit)
  window.addEventListener("scroll", onScroll, { passive: true })
  onScroll()
}
