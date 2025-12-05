import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"

/**
 * POST /api/bridge/sync-status
 * Sync Bridge customer status to database
 * Fetches latest customer data from Bridge and updates user record
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    // Use server client to bypass RLS for updates
    const supabase = createServerClient()
    
    // requireUser already fetched the profile with all fields (select("*"))
    // Use user.profile directly - it has all user data including bridge_customer_id
    const userProfile = user.profile

    if (!userProfile?.bridge_customer_id) {
      return NextResponse.json({
        success: false,
        message: "No Bridge customer ID found",
        synced: false,
      })
    }

    // Fetch latest customer data from Bridge
    let customerData: any = null
    try {
      customerData = await bridgeService.getCustomer(userProfile.bridge_customer_id)
      console.log(`[SYNC-STATUS] Fetched customer data from Bridge:`, {
        customerId: customerData?.id,
        kycStatus: customerData?.kyc_status,
        hasRejectionReasons: !!customerData?.rejection_reasons,
        rejectionReasonsCount: customerData?.rejection_reasons?.length || 0,
      })
    } catch (bridgeError: any) {
      console.error("[SYNC-STATUS] Error fetching customer from Bridge:", bridgeError.message)
      return createErrorResponse(
        `Failed to fetch customer from Bridge: ${bridgeError.message}`,
        500
      )
    }

    if (!customerData) {
      return createErrorResponse("Customer data not found in Bridge", 404)
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Update KYC status if available
    if (customerData.kyc_status) {
      updateData.bridge_kyc_status = customerData.kyc_status
    }

    // Update rejection reasons if available (especially important for rejected status)
    if (customerData.rejection_reasons) {
      updateData.bridge_kyc_rejection_reasons = customerData.rejection_reasons
      console.log(`[SYNC-STATUS] Storing rejection_reasons:`, customerData.rejection_reasons)
    } else if (customerData.kyc_status === 'rejected' && !customerData.rejection_reasons) {
      // If status is rejected but no rejection_reasons, log a warning
      console.warn(`[SYNC-STATUS] Status is rejected but no rejection_reasons in Bridge response`)
    }

    // Update endorsements if available
    if (customerData.endorsements) {
      updateData.bridge_endorsements = customerData.endorsements
    }

    // Update database
    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)

    if (updateError) {
      console.error("[SYNC-STATUS] Error updating user record:", updateError)
      return createErrorResponse("Failed to update user record", 500)
    }

    console.log(`[SYNC-STATUS] Successfully synced Bridge status to database:`, {
      userId: user.id,
      customerId: userProfile.bridge_customer_id,
      kycStatus: updateData.bridge_kyc_status,
      hasRejectionReasons: !!updateData.bridge_kyc_rejection_reasons,
    })

    // Return updated data
    return NextResponse.json({
      success: true,
      synced: true,
      data: {
        kycStatus: updateData.bridge_kyc_status || userProfile.bridge_kyc_status,
        rejectionReasons: updateData.bridge_kyc_rejection_reasons || userProfile.bridge_kyc_rejection_reasons,
        endorsements: updateData.bridge_endorsements || null,
      },
    })
  } catch (error: any) {
    console.error("[SYNC-STATUS] Unexpected error:", error)
    return createErrorResponse(
      `Failed to sync status: ${error.message || "Unknown error"}`,
      500
    )
  }
})

