import { type NextRequest, NextResponse } from "next/server"
import { featureFlagService } from "@/lib/feature-flag-service"
import { requireAdmin } from "@/lib/admin-auth-utils"
import { withErrorHandling, createErrorResponse } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    await requireAdmin(req)
    try {
    const flags = await featureFlagService.getAllFeatureFlags()
      console.log("Feature flags fetched:", flags)
    return NextResponse.json({ flags })
    } catch (error) {
      console.error("Error fetching feature flags:", error)
      throw error
    }
  })(request)
}

export async function PATCH(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    try {
      console.log("PATCH /api/admin/feature-flags - Starting")
      
      // Check admin access first
      const admin = await requireAdmin(req)
      console.log("PATCH /api/admin/feature-flags - Admin verified:", admin.email)
      
      // Then read the request body
      const body = await req.json()
      console.log("PATCH /api/admin/feature-flags - Request body:", body)
      const { feature_key, is_enabled } = body

    if (!feature_key || typeof is_enabled !== "boolean") {
        console.log("PATCH /api/admin/feature-flags - Validation failed")
      return createErrorResponse("Missing required fields: feature_key and is_enabled", 400)
    }

      console.log("PATCH /api/admin/feature-flags - Updating flag:", feature_key, "to", is_enabled)
      
      try {
    const updatedFlag = await featureFlagService.updateFeatureFlag(
      feature_key,
      is_enabled,
      admin.id,
    )
        console.log("PATCH /api/admin/feature-flags - Flag updated successfully:", updatedFlag)

    return NextResponse.json({ flag: updatedFlag })
      } catch (dbError: any) {
        console.error("PATCH /api/admin/feature-flags - Database error:", dbError)
        // Re-throw with a more descriptive message
        throw new Error(`Database error: ${dbError.message || 'Failed to update feature flag'}`)
      }
    } catch (error: any) {
      console.error("PATCH /api/admin/feature-flags - Unexpected error:", error)
      // Re-throw to let withErrorHandling handle it
      throw error
    }
  })(request)
}

