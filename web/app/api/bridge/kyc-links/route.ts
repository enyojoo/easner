import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { randomUUID } from "crypto"
import { supabase } from "@/lib/supabase"

/**
 * POST /api/bridge/kyc-links
 * Create a KYC link for the authenticated user
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { full_name, email, type = "individual" } = body

  if (!email) {
    return createErrorResponse("Email is required", 400)
  }

  if (!full_name) {
    return createErrorResponse("Full name is required", 400)
  }

  try {
    // Create KYC link using Bridge API
    const kycLinkResponse = await bridgeService.createKycLink({
      full_name,
      email,
      type,
    })

    // Store customer_id and status in database if returned
    if (kycLinkResponse.customer_id) {
      try {
        const updateData: any = {
          bridge_customer_id: kycLinkResponse.customer_id,
          updated_at: new Date().toISOString(),
        }

        // Store KYC status if available
        if (kycLinkResponse.kyc_status) {
          updateData.bridge_kyc_status = kycLinkResponse.kyc_status
        }

        // Fetch full customer details to get complete status
        try {
          const customer = await bridgeService.getCustomer(kycLinkResponse.customer_id)
          updateData.bridge_kyc_status = customer.kyc_status || kycLinkResponse.kyc_status
          updateData.bridge_kyc_rejection_reasons = customer.rejection_reasons || []
          updateData.bridge_endorsements = customer.endorsements || []
        } catch (customerError: any) {
          console.warn("[KYC-LINKS] Could not fetch full customer details:", customerError.message)
          // Continue with partial data
        }

        const { error: updateError } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", user.id)

        if (updateError) {
          console.error("[KYC-LINKS] Error storing customer data:", updateError)
        } else {
          console.log(`[KYC-LINKS] Stored bridge_customer_id: ${kycLinkResponse.customer_id}, status: ${updateData.bridge_kyc_status}`)
        }
      } catch (dbError: any) {
        console.error("[KYC-LINKS] Error updating database:", dbError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      kyc_link: kycLinkResponse.kyc_link,
      tos_link: kycLinkResponse.tos_link,
      kyc_status: kycLinkResponse.kyc_status || "not_started",
      tos_status: kycLinkResponse.tos_status || "pending",
      customer_id: kycLinkResponse.customer_id,
      kyc_link_id: kycLinkResponse.id,
    })
  } catch (error: any) {
    console.error("Error creating KYC link:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      email,
      full_name,
      type,
    })

    // Check if error indicates existing KYC link
    if (error.message && error.message.includes('kyc link has already been created')) {
      // Try to get existing customer and their KYC link
      try {
        // Get user's bridge_customer_id from database
        const { data: userProfile } = await supabase
          .from("users")
          .select("bridge_customer_id")
          .eq("id", user.id)
          .single()

        if (userProfile?.bridge_customer_id) {
          // Get KYC link for existing customer
          const kycLinkData = await bridgeService.getKycLink(userProfile.bridge_customer_id)
          
          // Get customer details to get status
          const customer = await bridgeService.getCustomer(userProfile.bridge_customer_id)
          
          // Update database with latest status from Bridge
          try {
            const { error: updateError } = await supabase
              .from("users")
              .update({
                bridge_kyc_status: customer.kyc_status || "not_started",
                bridge_kyc_rejection_reasons: customer.rejection_reasons || [],
                bridge_endorsements: customer.endorsements || [],
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id)

            if (updateError) {
              console.error("[KYC-LINKS] Error updating customer status:", updateError)
            } else {
              console.log(`[KYC-LINKS] Updated customer status: ${customer.kyc_status}`)
            }
          } catch (dbError: any) {
            console.error("[KYC-LINKS] Error updating database:", dbError)
            // Continue anyway
          }
          
          return NextResponse.json({
            kyc_link: kycLinkData.kyc_link,
            tos_link: null, // TOS link might not be available for existing customers
            kyc_status: customer.kyc_status || "not_started",
            tos_status: customer.tos_status || "pending",
            customer_id: userProfile.bridge_customer_id,
            kyc_link_id: `customer-${userProfile.bridge_customer_id}`,
          })
        } else {
          // No customer_id in database, but Bridge says link exists
          // Try to find customer by email and store it
          try {
            const customers = await bridgeService.listCustomersByEmail(email)
            if (customers && customers.length > 0) {
              const customer = customers[0]
              const customerId = customer.id
              
              // Store customer_id in database
              const { error: updateError } = await supabase
                .from("users")
                .update({
                  bridge_customer_id: customerId,
                  bridge_kyc_status: customer.kyc_status || customer.status || "not_started",
                  bridge_kyc_rejection_reasons: customer.rejection_reasons || [],
                  bridge_endorsements: customer.endorsements || [],
                  updated_at: new Date().toISOString(),
                })
                .eq("id", user.id)

              if (updateError) {
                console.error("[KYC-LINKS] Error storing customer_id:", updateError)
              } else {
                console.log(`[KYC-LINKS] Stored customer_id from email lookup: ${customerId}`)
              }

              // Get KYC link for this customer
              const kycLinkData = await bridgeService.getKycLink(customerId)
              
              return NextResponse.json({
                kyc_link: kycLinkData.kyc_link,
                tos_link: null,
                kyc_status: customer.kyc_status || customer.status || "not_started",
                tos_status: customer.tos_status || "pending",
                customer_id: customerId,
                kyc_link_id: `customer-${customerId}`,
              })
            }
          } catch (lookupError: any) {
            console.error("[KYC-LINKS] Error looking up customer by email:", lookupError)
            // Fall through to return error
          }
        }
      } catch (lookupError: any) {
        console.error("Error looking up existing customer:", lookupError)
        // Fall through to return error
      }
    }

    return createErrorResponse(
      `Failed to create KYC link: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

