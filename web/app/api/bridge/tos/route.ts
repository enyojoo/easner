import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"
import { randomUUID } from "crypto"

/**
 * POST /api/bridge/tos
 * Create a TOS link for the authenticated user
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { email, type = "individual" } = body

  if (!email) {
    return createErrorResponse("Email is required", 400)
  }

  try {
    // First, check if user has an existing Bridge customer
    // If they do, use the tos_link from the customer object
    const { createServerClient } = await import("@/lib/supabase")
    const supabase = createServerClient()
    
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_signed_agreement_id")
      .eq("id", user.id)
      .single()
    
    // CRITICAL: If TOS is already signed, don't try to create a new TOS link!
    // This prevents 401 errors when TOS is already accepted
    if (userProfile?.bridge_signed_agreement_id) {
      console.log("User already has signed_agreement_id, TOS is accepted. Returning existing status.")
      return NextResponse.json({
        tosLink: null,
        tosLinkId: userProfile.bridge_customer_id ? `customer-${userProfile.bridge_customer_id}` : null,
        alreadyAccepted: true,
      })
    }
    
    if (userProfile?.bridge_customer_id) {
      console.log("User has existing Bridge customer, using GET /v0/customers/{customerID}/tos_acceptance_link")
      try {
        // First check if customer has already accepted TOS
        const customer = await bridgeService.getCustomer(userProfile.bridge_customer_id)
        const hasAcceptedTOS = (customer as any).has_accepted_terms_of_service === true
        
        if (hasAcceptedTOS) {
          console.log("Customer already accepted TOS")
            return NextResponse.json({
              tosLink: null,
              tosLinkId: `customer-${userProfile.bridge_customer_id}`,
              alreadyAccepted: true,
            })
          }
        
        // Construct redirect_uri for production TOS flow
        let baseUrl = 'http://localhost:3000' // Default fallback

        if (process.env.VERCEL_URL) {
          baseUrl = `https://${process.env.VERCEL_URL}`
        } else if (process.env.NEXT_PUBLIC_APP_URL) {
          baseUrl = process.env.NEXT_PUBLIC_APP_URL
        }

        const redirectUri = `${baseUrl}/api/bridge/tos/callback?userId=${user.id}`
        
        console.log("Getting TOS acceptance link for existing customer with redirect_uri:", redirectUri)
        
        // Use GET /v0/customers/{customerID}/tos_acceptance_link for existing customers
        const tosLink = await bridgeService.getTOSLinkForCustomer(
          userProfile.bridge_customer_id,
          redirectUri
        )
        
        if (!tosLink || !tosLink.tos_link) {
          console.error("TOS acceptance link retrieved but missing tos_link field:", tosLink)
          return createErrorResponse(
            "TOS acceptance link was retrieved but is missing the link URL. Please try again or contact support.",
            500,
          )
        }
        
        console.log("TOS acceptance link retrieved successfully:", { tosLinkId: tosLink.id, hasLink: !!tosLink.tos_link })
        
        return NextResponse.json({
          tosLink: tosLink.tos_link,
          tosLinkId: tosLink.id || `customer-${userProfile.bridge_customer_id}`,
          fromCustomer: true, // Flag to indicate this came from existing customer
        })
      } catch (customerError: any) {
        console.error("Error getting TOS acceptance link for customer:", customerError.message)
        return createErrorResponse(
          `Failed to get TOS acceptance link for existing customer: ${customerError.message}`,
          500,
        )
      }
    }
    
    // No existing customer - try to create standalone TOS link
    // In Bridge, you CAN create a TOS link without a customer (though customer object is preferred)
    // BUT ONLY if TOS is not already accepted (we checked above, but double-check)
    if (userProfile?.bridge_signed_agreement_id) {
      console.log("TOS already accepted (double-check), skipping TOS link generation")
      return NextResponse.json({
        tosLink: null,
        tosLinkId: userProfile.bridge_customer_id ? `customer-${userProfile.bridge_customer_id}` : null,
        alreadyAccepted: true,
      })
    }
    
    // If no customer exists, try to create standalone TOS link
    // NOTE: In production, the /v0/tos_links endpoint may require special permissions
    // or may not be available. If it fails, we'll return a helpful error message.
    if (!userProfile?.bridge_customer_id) {
    // Check if Bridge API key is configured
    const bridgeApiKey = process.env.BRIDGE_API_KEY
    if (!bridgeApiKey) {
      console.error("BRIDGE_API_KEY is not set in environment variables")
      return createErrorResponse(
        "Bridge API key is not configured. Please set BRIDGE_API_KEY in your environment variables.",
        500,
      )
    }
    
      console.log("Generating standalone TOS link:", { email, type, hasApiKey: !!bridgeApiKey, apiKeyPrefix: bridgeApiKey?.substring(0, 7) })
    
      // Construct redirect_uri for production TOS flow
      // Bridge will redirect back to this URL with signed_agreement_id in query params
      let baseUrl = 'http://localhost:3000' // Default fallback

      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else if (process.env.NEXT_PUBLIC_APP_URL) {
        baseUrl = process.env.NEXT_PUBLIC_APP_URL
      }

      const redirectUri = `${baseUrl}/api/bridge/tos/callback?userId=${user.id}`
      
      console.log("TOS redirect_uri:", redirectUri)
      
      // Use POST /v0/customers/tos_links for new customers (no customer exists yet)
      try {
        const tosLink = await bridgeService.getTOSLink(
          email, 
          type, 
          redirectUri
        )
        
        if (!tosLink || !tosLink.tos_link) {
          console.error("TOS link created but missing tos_link field:", tosLink)
          return createErrorResponse(
            "TOS link was created but is missing the link URL. Please try again or contact support.",
            500,
          )
        }
        
        console.log("Standalone TOS link created successfully:", { tosLinkId: tosLink.id, hasLink: !!tosLink.tos_link })
        
        return NextResponse.json({
          tosLink: tosLink.tos_link,
          tosLinkId: tosLink.id,
        })
      } catch (tosError: any) {
        console.error("\n========== TOS LINK CREATION FAILED ==========")
        console.error("Failed to create standalone TOS link. Full error:", tosError.message)
        console.error("Error stack:", tosError.stack)
        console.error("==============================================\n")
        
        // Check if it's a 401 authentication error
        const isAuthError = tosError.message?.toLowerCase().includes("unauthorized") || 
                           tosError.message?.toLowerCase().includes("401") ||
                           tosError.message?.toLowerCase().includes("authentication")
        
        if (isAuthError) {
          // The /v0/tos_links endpoint may not be available or may require special permissions in production
          // In production, TOS links are typically created as part of customer creation
          // Return a helpful error message suggesting the user complete KYC first
          console.error("[TOS] 401 Error - Possible causes:")
          console.error("1. API key may not have permissions for /v0/tos_links endpoint")
          console.error("2. The /v0/tos_links endpoint may not be available in production")
          console.error("3. TOS links should be created via customer creation in production")
          console.error("4. User should complete KYC first, then customer will be created with TOS link")
          
          return createErrorResponse(
            `Unable to create TOS link: The Bridge API returned an authentication error. ` +
            `In production, TOS links are typically created when you create a customer account. ` +
            `Please complete your identity and address verification first, then the TOS link will be generated automatically when your account is created. ` +
            `If you have already completed verification, please try again or contact support.`,
            403, // Use 403 Forbidden instead of 401 to indicate permission issue
          )
        }
        
        return createErrorResponse(
          `Failed to create TOS link: ${tosError.message}. ` +
          `The detailed Bridge API response has been logged to the server console.`,
          500,
        )
      }
    }
    
    // Customer exists but no TOS link - this shouldn't happen
    // Return error suggesting to contact support
    console.error("Customer exists but TOS link is not available. This may be a Bridge API issue.")
    return createErrorResponse(
      `Customer exists but TOS link is not available. This may be a Bridge API limitation or the customer needs to be updated. ` +
      `Please try completing KYC again or contact support. Customer ID: ${userProfile.bridge_customer_id}`,
      500,
    )

    if (!tosLink || !tosLink.tos_link) {
      console.error("TOS link created but missing tos_link field:", tosLink)
      return createErrorResponse(
        "TOS link was created but is missing the link URL. Please try again or contact support.",
        500,
      )
    }

    console.log("TOS link created successfully:", { tosLinkId: tosLink.id, hasLink: !!tosLink.tos_link })

    return NextResponse.json({
      tosLink: tosLink.tos_link,
      tosLinkId: tosLink.id,
    })
  } catch (error: any) {
    console.error("Error creating TOS link:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      email,
      type,
      bridgeApiKey: process.env.BRIDGE_API_KEY ? `${process.env.BRIDGE_API_KEY.substring(0, 7)}...` : 'NOT SET',
      bridgeApiBaseUrl: process.env.BRIDGE_API_BASE_URL || 'NOT SET',
    })
    
    // Check if it's an authentication error
    const errorMessage = error.message || "Unknown error"
    const isAuthError = errorMessage.toLowerCase().includes("authentication") || 
                        errorMessage.toLowerCase().includes("unauthorized") ||
                        errorMessage.toLowerCase().includes("401")
    
    if (isAuthError) {
      return createErrorResponse(
        `Authentication failed: ${errorMessage}. Please check that BRIDGE_API_KEY is set correctly in your environment variables.`,
        401,
      )
    }
    
    return createErrorResponse(
      `Failed to create TOS link: ${errorMessage}`,
      500,
    )
  }
})

/**
 * GET /api/bridge/tos?tosLinkId=xxx
 * Check if TOS has been accepted
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { searchParams } = new URL(request.url)
  const tosLinkId = searchParams.get("tosLinkId")

  if (!tosLinkId) {
    return createErrorResponse("tosLinkId is required", 400)
  }

  try {
    // If tosLinkId starts with "customer-", it means we're checking TOS status via customer object
    if (tosLinkId.startsWith('customer-')) {
      const customerId = tosLinkId.replace('customer-', '')
      console.log("[TOS-STATUS] Checking TOS status via customer object:", customerId)
      
      const customer = await bridgeService.getCustomer(customerId)
      const hasAcceptedTOS = (customer as any).has_accepted_terms_of_service === true
      const signedAgreementId = (customer as any).signed_agreement_id
      
      console.log("[TOS-STATUS] Customer TOS status:", { 
        hasAcceptedTOS, 
        customerId,
        hasSignedAgreementId: !!signedAgreementId,
        signedAgreementId: signedAgreementId ? `${signedAgreementId.substring(0, 8)}...` : undefined
      })
      
      return NextResponse.json({
        signed: hasAcceptedTOS,
        signedAgreementId: signedAgreementId || undefined,
        fromCustomer: true,
      })
    }
    
    // Regular TOS link ID - check Bridge TOS status
    const status = await bridgeService.getSignedAgreementStatus(tosLinkId)
    
    // If TOS is signed and we have a signed_agreement_id, update the customer if one exists
    if (status.signed && status.signed_agreement_id) {
      const supabase = createServerClient()
      
      const { data: userProfile } = await supabase
        .from("users")
        .select("bridge_customer_id")
        .eq("id", user.id)
        .single()
      
      if (userProfile?.bridge_customer_id) {
        console.log(`[TOS-STATUS] TOS signed with signed_agreement_id. Updating customer ${userProfile.bridge_customer_id}...`)
        try {
          await bridgeService.updateCustomerTOS(userProfile.bridge_customer_id, status.signed_agreement_id)
          
          // Store signed_agreement_id in database
          await supabase
            .from("users")
            .update({
              bridge_signed_agreement_id: status.signed_agreement_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
          
          console.log(`[TOS-STATUS] Customer updated successfully with signed_agreement_id`)
        } catch (updateError: any) {
          console.error(`[TOS-STATUS] Error updating customer TOS:`, updateError.message)
          // Don't fail the request - TOS is signed, just couldn't update customer
        }
      }
    }

    return NextResponse.json({
      signed: status.signed,
      signedAgreementId: status.signed_agreement_id,
    })
  } catch (error: any) {
    console.error("Error checking TOS status:", error)
    return createErrorResponse(
      `Failed to check TOS status: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

