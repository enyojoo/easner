import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")
  const url = request.nextUrl.clone()

  // Check if the host doesn't start with 'www.' and is not localhost or vercel preview
  if (
    host &&
    !host.startsWith("www.") &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1") &&
    !host.includes(".vercel.app") &&
    !host.includes(".netlify.app") &&
    !host.includes(".herokuapp.com")
  ) {
    url.host = `www.${host}`
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
