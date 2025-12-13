import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"
import { syncBridgeKycDataToDatabase } from "@/lib/bridge-kyc-sync"
import { completeAccountSetupAfterKYC } from "@/lib/bridge-onboarding-service"

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
      
      // Also try fetching by email to compare data
      if (userProfile.email) {
        try {
          console.log(`[SYNC-STATUS] Also fetching customer by email for comparison: ${userProfile.email}`)
          const customersByEmail = await bridgeService.listCustomersByEmail(userProfile.email)
          if (customersByEmail && customersByEmail.length > 0) {
            console.log(`[SYNC-STATUS] Customer data by email (for comparison):`, {
              found: customersByEmail.length,
              customerIds: customersByEmail.map((c: any) => c.id),
              firstCustomerKeys: customersByEmail[0] ? Object.keys(customersByEmail[0]) : [],
              firstCustomerFull: JSON.stringify(customersByEmail[0], null, 2),
            })
          }
        } catch (emailError: any) {
          console.warn(`[SYNC-STATUS] Could not fetch by email (non-critical):`, emailError.message)
        }
      }
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

    // Derive KYC status from customer data
    // Bridge API may return kyc_status directly, or we need to derive it from status/endorsements
    let kycStatus: string | undefined = undefined
    
    if (customerData.kyc_status) {
      // Direct kyc_status field exists
      kycStatus = customerData.kyc_status
    } else if (customerData.status) {
      // Map customer status to KYC status
      // "active" typically means approved, "pending" means pending, etc.
      if (customerData.status === 'active') {
        // Check endorsements to confirm approval
        const endorsements = customerData.endorsements || []
        const hasApprovedEndorsement = endorsements.some((e: any) => e.status === 'approved')
        if (hasApprovedEndorsement) {
          kycStatus = 'approved'
        } else {
          // Active but no approved endorsements yet - could be pending
          kycStatus = 'pending'
        }
      } else if (customerData.status === 'rejected') {
        kycStatus = 'rejected'
      } else {
        // Map other statuses
        kycStatus = customerData.status
      }
    } else if (customerData.endorsements && Array.isArray(customerData.endorsements)) {
      // Derive from endorsements if no status field
      const endorsements = customerData.endorsements
      const hasApprovedEndorsement = endorsements.some((e: any) => e.status === 'approved')
      if (hasApprovedEndorsement) {
        kycStatus = 'approved'
      }
    }

    // Update KYC status if we determined one
    if (kycStatus) {
      updateData.bridge_kyc_status = kycStatus
      console.log(`[SYNC-STATUS] Determined KYC status: ${kycStatus}`, {
        fromKycStatus: !!customerData.kyc_status,
        fromStatus: !!customerData.status,
        customerStatus: customerData.status,
        hasEndorsements: !!customerData.endorsements,
      })
    }

    // Update rejection reasons if available (especially important for rejected status)
    if (customerData.rejection_reasons) {
      updateData.bridge_kyc_rejection_reasons = customerData.rejection_reasons
      console.log(`[SYNC-STATUS] Storing rejection_reasons:`, customerData.rejection_reasons)
    } else if (kycStatus === 'rejected' && !customerData.rejection_reasons) {
      // If status is rejected but no rejection_reasons, log a warning
      console.warn(`[SYNC-STATUS] Status is rejected but no rejection_reasons in Bridge response`)
    }

    // Update endorsements if available
    if (customerData.endorsements) {
      updateData.bridge_endorsements = customerData.endorsements
    }

    // Update database with status first
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

    // ALWAYS sync full customer data when KYC is approved
    // This ensures the database has all customer data matching Bridge dashboard
    if (kycStatus === 'approved' || userProfile.bridge_kyc_status === 'approved') {
      try {
        console.log(`[SYNC-STATUS] KYC approved, syncing full customer data from Bridge...`)
        console.log(`[SYNC-STATUS] Customer data from Bridge:`, {
          hasFirstName: !!customerData.first_name,
          hasLastName: !!customerData.last_name,
          hasMiddleName: !!customerData.middle_name,
          hasBirthDate: !!customerData.birth_date,
          hasResidentialAddress: !!customerData.residential_address,
          customerDataKeys: Object.keys(customerData || {}),
        })
        
        const syncResult = await syncBridgeKycDataToDatabase(
          userProfile.bridge_customer_id,
          user.id
        )
        if (syncResult.success) {
          console.log(`[SYNC-STATUS] ✅ Successfully synced full customer data from Bridge`)
        } else {
          console.error(`[SYNC-STATUS] ❌ Failed to sync full customer data: ${syncResult.error}`)
          // Don't fail the request - status was updated successfully, but log the error
        }
      } catch (syncError: any) {
        console.error(`[SYNC-STATUS] ❌ Error syncing full customer data:`, syncError)
        console.error(`[SYNC-STATUS] Error details:`, {
          message: syncError.message,
          stack: syncError.stack,
        })
        // Don't fail the request - status was updated successfully
      }

      // Create wallet and virtual accounts automatically when KYC is approved
      // This ensures accounts are available immediately after approval
      // Only create accounts if user has a Bridge customer ID
      if (userProfile.bridge_customer_id) {
        try {
          console.log(`[SYNC-STATUS] KYC approved, creating wallet and virtual accounts automatically...`)
          // Pass bridge_customer_id directly to avoid re-querying database
          await completeAccountSetupAfterKYC(user.id, userProfile.bridge_customer_id)
          console.log(`[SYNC-STATUS] ✅ Successfully created accounts after KYC approval`)
        } catch (accountError: any) {
          console.error(`[SYNC-STATUS] ❌ Error creating accounts after KYC approval:`, accountError)
          console.error(`[SYNC-STATUS] Account creation error details:`, {
            message: accountError.message,
            stack: accountError.stack,
          })
          // Don't fail the request - accounts may already exist or will be created via webhook
        }
      } else {
        console.log(`[SYNC-STATUS] KYC approved but user does not have bridge_customer_id yet. Accounts will be created when customer ID is available.`)
      }
    }

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

