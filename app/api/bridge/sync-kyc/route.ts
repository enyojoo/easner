import { type NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { syncBridgeKycDataToDatabase } from "@/lib/bridge-kyc-sync"

/**
 * POST /api/bridge/sync-kyc
 * Sync KYC data from Bridge to our database
 * Called when KYC is completed via Bridge widget
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { customer_id, user_id } = body

  if (!customer_id) {
    return createErrorResponse("customer_id is required", 400)
  }

  if (!user_id) {
    return createErrorResponse("user_id is required", 400)
  }

  // Verify the user_id matches the authenticated user
  if (user_id !== user.id) {
    return createErrorResponse("user_id does not match authenticated user", 403)
  }

  try {
    const result = await syncBridgeKycDataToDatabase(customer_id, user_id)
    
    if (!result.success) {
      return createErrorResponse(
        result.error || "Failed to sync KYC data",
        500
      )
    }

    return NextResponse.json({
      success: true,
      message: "KYC data synced successfully",
    })
  } catch (error: any) {
    console.error("Error syncing KYC data:", error)
    return createErrorResponse(
      `Failed to sync KYC data: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

