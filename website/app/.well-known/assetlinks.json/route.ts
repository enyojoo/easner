import { buildAssetLinks, jsonResponse } from "@/lib/mobile-app-links"

export const dynamic = "force-dynamic"

export function GET() {
  const raw = process.env.ANDROID_SHA256_CERT_FINGERPRINTS ?? ""
  const fingerprints = raw
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)

  if (fingerprints.length === 0) {
    return jsonResponse(
      { error: "ANDROID_SHA256_CERT_FINGERPRINTS is not configured" },
      { status: 503, cacheMaxAge: 0 },
    )
  }

  return jsonResponse(buildAssetLinks(fingerprints))
}
