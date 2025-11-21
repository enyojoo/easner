import { type NextRequest, NextResponse } from "next/server"
import { featureFlagService } from "@/lib/feature-flag-service"
import { withErrorHandling } from "@/lib/auth-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } },
) {
  return withErrorHandling(async () => {
    try {
    const flag = await featureFlagService.getFeatureFlag(params.key)
      console.log(`Feature flag ${params.key} lookup:`, flag ? "found" : "not found")

      // Return default values if flag doesn't exist (for development/testing)
    if (!flag) {
        console.log(`Feature flag ${params.key} not found, returning default: false`)
        return NextResponse.json({
          is_enabled: false,
        })
    }

      console.log(`Feature flag ${params.key} is_enabled:`, flag.is_enabled)
    return NextResponse.json({
      is_enabled: flag.is_enabled,
      })
    } catch (error) {
      console.error(`Error fetching feature flag ${params.key}:`, error)
      // Return false on error to prevent breaking the UI
      return NextResponse.json({
        is_enabled: false,
    })
    }
  })()
}

