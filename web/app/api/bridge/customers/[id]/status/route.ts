import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/bridge/customers/[id]/status
 * Get customer KYC status and endorsement status
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const user = await requireUser(request)
  const customerId = params.id

  try {
    const status = await bridgeService.getCustomerStatus(customerId)

    return NextResponse.json({
      kycStatus: status.kyc_status,
      endorsements: status.endorsements,
      rejectionReasons: status.rejection_reasons,
    })
  } catch (error: any) {
    console.error("Error fetching customer status:", error)
    return createErrorResponse(
      `Failed to fetch customer status: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

