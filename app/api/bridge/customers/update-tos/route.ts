import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"
import { buildBridgeCustomerPayloadFromKyc } from "@/lib/bridge-kyc-builder"
import { initializeBridgeAccount } from "@/lib/bridge-onboarding-service"

/**
 * PUT /api/bridge/customers/update-tos
 * Update customer with signed_agreement_id after TOS acceptance
 */
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { signedAgreementId } = body

  if (!signedAgreementId) {
    return createErrorResponse("signedAgreementId is required", 400)
  }

  try {
    const supabase = createServerClient()
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id, email, first_name, last_name")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return createErrorResponse(
        "No Bridge customer found. Please create a customer first.",
        404
      )
    }

    console.log(`[UPDATE-TOS] Updating customer ${userProfile.bridge_customer_id} with signed_agreement_id: ${signedAgreementId.substring(0, 8)}...`)

    // Try to update the customer with signed_agreement_id
    try {
      const updatedCustomer = await bridgeService.updateCustomerTOS(
        userProfile.bridge_customer_id,
        signedAgreementId
      )

      const hasAcceptedTOS = (updatedCustomer as any).has_accepted_terms_of_service === true
      console.log(`[UPDATE-TOS] Customer updated. has_accepted_terms_of_service: ${hasAcceptedTOS}`)

      // Store signed_agreement_id in database
      await supabase
        .from("users")
        .update({
          bridge_signed_agreement_id: signedAgreementId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      // If update worked and TOS is accepted, return success
      if (hasAcceptedTOS) {
        return NextResponse.json({
          success: true,
          customerId: updatedCustomer.id,
          hasAcceptedTOS: true,
        })
      }

      // If update didn't set has_accepted_terms_of_service to true, return the current state
      return NextResponse.json({
        success: true,
        customerId: updatedCustomer.id,
        hasAcceptedTOS: false,
        warning: "Customer updated but has_accepted_terms_of_service is still false. This may be a Bridge API limitation.",
      })
    } catch (updateError: any) {
      // If update failed, throw the error
      throw updateError
    }
  } catch (error: any) {
    console.error("Error updating customer TOS:", error)
    return createErrorResponse(
      `Failed to update customer TOS: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

