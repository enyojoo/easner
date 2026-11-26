import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { REGION_COOKIE, regionForCountry, type AnalyticsRegion } from "@/lib/analytics-consent"
import { getRedirects } from "@/lib/blog/redirects"
import { resolveAppPathResponse } from "@/lib/short-link-redirect"

/**
 * Analytics region from Vercel's geo header. Locally there is no header, so dev defaults to "open";
 * pass `?geo=DE` (or any ISO country) in development to emulate a visitor from that country.
 */
function resolveAnalyticsRegion(request: NextRequest): AnalyticsRegion {
  if (process.env.NODE_ENV !== "production") {
    const override = request.nextUrl.searchParams.get("geo")
    if (override) return regionForCountry(override)
    const existing = request.cookies.get(REGION_COOKIE)?.value
    if (existing === "consent" || existing === "open") return existing
    return "open"
  }
  return regionForCountry(request.headers.get("x-vercel-ip-country"))
}

function withAnalyticsRegion(request: NextRequest, response: NextResponse): NextResponse {
  const region = resolveAnalyticsRegion(request)
  if (request.cookies.get(REGION_COOKIE)?.value !== region) {
    // Session cookie, readable by the client, no identifier: strictly necessary to apply consent rules.
    response.cookies.set(REGION_COOKIE, region, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    })
  }
  return response
}

/**
 * Blog routing that needs the request: crawlable pagination, and 301s for renamed posts.
 *
 * Pagination: `/blog?page=N`, `/blog/categories/<slug>?page=N` and `/blog/authors/<slug>?page=N` are real, indexable,
 * self-canonical URLs. They are served by static ISR routes (`.../page/N`) through an internal rewrite, so the page
 * never reads `searchParams` and stays static HTML. A direct request to `.../page/N` redirects back to `?page=N`.
 */
const PAGED = /^\/blog(?:\/(?:categories|authors)\/[^/]+)?$/
const PAGE_ROUTE = /^(\/blog(?:\/(?:categories|authors)\/[^/]+)?)\/page\/(\d+)\/?$/
const POST_SLUG = /^\/blog\/([^/]+)\/?$/
const SECTIONS = new Set(["categories", "authors", "page", "search", "preview", "feed.xml", "opengraph-image"])

/** Old post slugs, from `blog_redirects`. Small table, so one read per minute per instance. */
let redirects: { at: number; map: Map<string, string> } | null = null
async function redirectFor(slug: string): Promise<string | undefined> {
  if (!redirects || Date.now() - redirects.at > 60_000) {
    try {
      redirects = { at: Date.now(), map: await getRedirects() }
    } catch (error) {
      console.error("[blog] redirects lookup failed", error)
      redirects = { at: Date.now() - 50_000, map: redirects?.map ?? new Map() }
    }
  }
  return redirects.map.get(slug)
}

async function blogResponse(request: NextRequest): Promise<NextResponse | null> {
  const { pathname, searchParams } = request.nextUrl

  const direct = PAGE_ROUTE.exec(pathname)
  if (direct) {
    const url = request.nextUrl.clone()
    url.pathname = direct[1]
    url.search = Number(direct[2]) > 1 ? `?page=${direct[2]}` : ""
    return NextResponse.redirect(url, 301)
  }

  const pageParam = searchParams.get("page")
  if (PAGED.test(pathname) && pageParam !== null) {
    const page = Number(pageParam)
    if (Number.isInteger(page) && page >= 2 && String(page) === pageParam) {
      const url = request.nextUrl.clone()
      url.pathname = `${pathname}/page/${page}`
      url.searchParams.delete("page")
      return NextResponse.rewrite(url)
    }
    const url = request.nextUrl.clone()
    url.searchParams.delete("page")
    return NextResponse.redirect(url, 301)
  }

  const post = POST_SLUG.exec(pathname)
  if (post && !SECTIONS.has(post[1]) && !post[1].endsWith(".md")) {
    const to = await redirectFor(decodeURIComponent(post[1]))
    if (to) {
      const url = request.nextUrl.clone()
      url.pathname = `/blog/${to}`
      return NextResponse.redirect(url, 301)
    }
  }
  return null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    pathname.length > 1 &&
    pathname.endsWith("/") &&
    !pathname.startsWith("/ingest") &&
    (request.method === "GET" || request.method === "HEAD")
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/\/+$/, "") || "/"
    return withAnalyticsRegion(request, NextResponse.redirect(url, 308))
  }

  const appPathResponse = resolveAppPathResponse(request)
  if (appPathResponse) return appPathResponse

  if (request.nextUrl.pathname === "/blog" || request.nextUrl.pathname.startsWith("/blog/")) {
    const response = await blogResponse(request)
    if (response) return withAnalyticsRegion(request, response)
  }

  return withAnalyticsRegion(request, NextResponse.next())
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ingest(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
