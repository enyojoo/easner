import {
  buildAppleAppSiteAssociation,
  jsonResponse,
} from "@/lib/mobile-app-links"

export const dynamic = "force-dynamic"

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID
  if (!teamId) {
    return jsonResponse(
      { error: "APPLE_TEAM_ID is not configured" },
      { status: 503, cacheMaxAge: 0 },
    )
  }
  return jsonResponse(buildAppleAppSiteAssociation(teamId))
}
