import { NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"

/**
 * GET /api/bridge/customers/[customerId]/kyc-link
 * Get KYC link for existing customer (missing requirements)
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { customerId: string } }
) => {
  const user = await requireUser(request)
  const { customerId } = params

  if (!customerId) {
    return createErrorResponse("Customer ID is required", 400)
  }

  try {
    // Verify user owns this customer
    const supabase = createServerClient()
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id")
      .eq("id", user.id)
      .single()

    if (userProfile?.bridge_customer_id !== customerId) {
      return createErrorResponse("Customer ID does not match your account", 403)
    }

    // Construct redirect_uri for callback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/bridge/kyc/callback?userId=${user.id}&customerId=${customerId}`

    // Get KYC link for existing customer
    const kycLink = await bridgeService.getKycLink(customerId, redirectUri)

    return NextResponse.json({
      kycLink: kycLink.kyc_link,
    })
  } catch (error: any) {
    console.error("Error getting KYC link:", error)
    return createErrorResponse(
      `Failed to get KYC link: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

