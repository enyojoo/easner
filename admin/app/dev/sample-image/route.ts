import { devHarnessEnabled } from "@/lib/dev-harness"

/** A sample picture for the harness's every-block document. Development only. */
export function GET() {
  // The picture lives inside a branch on a build-time constant: production builds drop it.
  if (process.env.NODE_ENV === "development" && devHarnessEnabled()) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b4dff"/><stop offset="1" stop-color="#0a1a4a"/></linearGradient></defs>
<rect width="1600" height="900" fill="url(#g)"/><circle cx="1180" cy="330" r="190" fill="#ffffff" fill-opacity=".14"/>
<text x="120" y="470" font-family="sans-serif" font-size="96" fill="#fff" font-weight="600">Sample cover</text>
<text x="120" y="560" font-family="sans-serif" font-size="40" fill="#fff" fill-opacity=".8">1600 × 900, focal point test</text></svg>`
    return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "no-store" } })
  }
  return new Response("Not found", { status: 404 })
}
