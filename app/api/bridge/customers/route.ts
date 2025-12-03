import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { initializeBridgeAccount } from "@/lib/bridge-onboarding-service"
import { buildBridgeCustomerPayloadFromKyc } from "@/lib/bridge-kyc-builder"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"
import { validateKYCForBridge } from "@/lib/bridge-kyc-validator"
import { kycService } from "@/lib/kyc-service"

/**
 * POST /api/bridge/customers
 * Create a Bridge customer using KYC data from database
 * 
 * Accepts minimal body: { signedAgreementId, needsUSD, needsEUR }
 * Reads all KYC data from kyc_submissions table
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()

  const {
    signedAgreementId,
    needsUSD = true,
    needsEUR = false,
  } = body

  // Validate required fields
  if (!signedAgreementId) {
    return createErrorResponse("signedAgreementId is required", 400)
  }

  // Use server client to bypass RLS
  const supabase = createServerClient()

  try {
    // Step 1: Get user data for validation
    console.log(`[CREATE-CUSTOMER] Fetching user data for validation...`)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      console.error(`[CREATE-CUSTOMER] Error fetching user data:`, userError)
      return createErrorResponse(
        `Failed to fetch user data: ${userError?.message || "User not found"}`,
        404,
      )
    }

    // Step 2: Get KYC submissions for validation
    console.log(`[CREATE-CUSTOMER] Fetching KYC submissions for validation...`)
    const submissions = await kycService.getByUserId(user.id, supabase)
    const identitySubmission = submissions.find(s => s.type === "identity")
    const addressSubmission = submissions.find(s => s.type === "address")

    console.log(`[CREATE-CUSTOMER] KYC submissions found:`, {
      total: submissions.length,
      identityFound: !!identitySubmission,
      addressFound: !!addressSubmission,
      identityStatus: identitySubmission?.status,
      addressStatus: addressSubmission?.status,
    })

    // Step 3: Validate KYC data before proceeding
    console.log(`[CREATE-CUSTOMER] Validating KYC data...`)
    const validation = validateKYCForBridge(
      identitySubmission,
      addressSubmission,
      userData.email,
      userData.first_name,
      userData.last_name
    )

    if (!validation.isValid) {
      console.error(`[CREATE-CUSTOMER] KYC validation failed:`, {
        errors: validation.errors,
        warnings: validation.warnings,
        missingFields: validation.missingFields,
      })
      
      return createErrorResponse(
        `KYC validation failed. Please complete all required verification steps.\n\n` +
        `Errors:\n${validation.errors.map(e => `- ${e}`).join('\n')}\n\n` +
        `Missing fields: ${validation.missingFields.join(', ')}`,
        400,
      )
    }

    // NOTE: Admin can send KYC to Bridge regardless of status via /api/admin/kyc/send-to-bridge
    // This endpoint still requires approval for user-initiated requests
    // Check that both KYC submissions are approved (unless called from admin endpoint)
    const isAdminRequest = request.headers.get('x-admin-request') === 'true'
    
    if (!isAdminRequest) {
      if (identitySubmission?.status !== "approved") {
        return createErrorResponse(
          `Identity verification must be approved before creating Bridge customer. Current status: ${identitySubmission?.status || 'not found'}`,
          400,
        )
      }

      if (addressSubmission?.status !== "approved") {
        return createErrorResponse(
          `Address verification must be approved before creating Bridge customer. Current status: ${addressSubmission?.status || 'not found'}`,
          400,
        )
      }
    } else {
      // Admin request - log status but don't block
      console.log(`[CREATE-CUSTOMER] Admin request - KYC status check bypassed:`, {
        identityStatus: identitySubmission?.status,
        addressStatus: addressSubmission?.status,
      })
    }

    if (validation.warnings.length > 0) {
      console.warn(`[CREATE-CUSTOMER] KYC validation warnings:`, validation.warnings)
      // Log warnings but don't block - these are optional fields
    }

    console.log(`[CREATE-CUSTOMER] KYC validation passed. Proceeding with customer creation...`)

    // Step 4: Save the signedAgreementId to the database
    console.log(`[CREATE-CUSTOMER] Saving signedAgreementId to database:`, signedAgreementId)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        bridge_signed_agreement_id: signedAgreementId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error(`[CREATE-CUSTOMER] Error saving signedAgreementId:`, updateError)
      return createErrorResponse(
        `Failed to save signed agreement: ${updateError.message}`,
        500,
      )
    }

    // Step 5: Build customer payload from KYC submissions in database
    // Pass server client to bypass RLS
    console.log(`[CREATE-CUSTOMER] Building customer payload from KYC data...`)
    const customerPayload = await buildBridgeCustomerPayloadFromKyc(
      user.id,
      signedAgreementId,
      needsUSD,
      needsEUR,
      supabase // Pass server client to bypass RLS
    )

    console.log(`[CREATE-CUSTOMER] Customer payload built successfully. Proceeding with account initialization...`)

    // Step 6: Initialize Bridge account (creates customer, wallet, virtual accounts)
    console.log(`[CREATE-CUSTOMER] Initializing Bridge account...`)
    const result = await initializeBridgeAccount({
      userId: user.id,
      email: userData.email,
      customerPayload,
      needsUSD,
      needsEUR,
    })

    console.log(`[CREATE-CUSTOMER] Bridge account initialized:`, {
      customerId: result.customerId,
      walletId: result.walletId,
      usdAccountId: result.usdVirtualAccountId,
      eurAccountId: result.eurVirtualAccountId,
    })

    // Get customer details
    const customer = await bridgeService.getCustomer(result.customerId)

    return NextResponse.json({
      customerId: result.customerId,
      kycStatus: customer.kyc_status,
      endorsements: customer.endorsements || [],
      walletId: result.walletId,
      usdVirtualAccountId: result.usdVirtualAccountId,
      eurVirtualAccountId: result.eurVirtualAccountId,
      rejectionReasons: customer.rejection_reasons,
    })
  } catch (error: any) {
    console.error("Error creating Bridge customer:", error)
    return createErrorResponse(
      `Failed to create customer: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

/**
 * GET /api/bridge/customers
 * Get the authenticated user's Bridge customer status
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    // Get user's Bridge customer ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_kyc_status, bridge_endorsements")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return NextResponse.json({
        hasCustomer: false,
      })
    }

    // Try to get customer details from Bridge (with timeout)
    // Fallback to database values if API call fails
    try {
      const customer = await Promise.race([
        bridgeService.getCustomer(userProfile.bridge_customer_id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
      ]) as any

    return NextResponse.json({
      hasCustomer: true,
      customerId: customer.id,
        kycStatus: customer.kyc_status || userProfile.bridge_kyc_status || 'pending',
        endorsements: customer.endorsements || userProfile.bridge_endorsements || [],
      rejectionReasons: customer.rejection_reasons,
    })
    } catch (error: any) {
      console.error("Error fetching customer from Bridge API, using database values:", error)
      // Return database values as fallback
      return NextResponse.json({
        hasCustomer: true,
        customerId: userProfile.bridge_customer_id,
        kycStatus: userProfile.bridge_kyc_status || 'pending',
        endorsements: userProfile.bridge_endorsements || [],
        rejectionReasons: null,
      })
    }
  } catch (error: any) {
    console.error("Error fetching Bridge customer:", error)
    return createErrorResponse(
      `Failed to fetch customer: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

