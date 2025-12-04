import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { randomUUID } from "crypto"

/**
 * POST /api/bridge/kyc-links
 * Create a KYC link for the authenticated user
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { full_name, email, type = "individual" } = body

  if (!full_name) {
    return createErrorResponse("full_name is required", 400)
  }

  if (!email) {
    return createErrorResponse("email is required", 400)
  }

  try {
    const result = await bridgeService.createKycLink(full_name, email, type)
    
    console.log("KYC link created successfully:", {
      hasKycLink: !!result.kyc_link,
      hasTosLink: !!result.tos_link,
      kycStatus: result.kyc_status,
      tosStatus: result.tos_status,
      hasCustomerId: !!result.customer_id,
    })

    return NextResponse.json({
      kyc_link: result.kyc_link,
      tos_link: result.tos_link,
      kyc_status: result.kyc_status,
      tos_status: result.tos_status,
      customer_id: result.customer_id,
    })
  } catch (error: any) {
    console.error("Error creating KYC link:", error)
    return createErrorResponse(
      `Failed to create KYC link: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

