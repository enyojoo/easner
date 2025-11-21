import { type NextRequest, NextResponse } from "next/server"
import { paymentCollectionService } from "@/lib/payment-collection-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/transactions/payment-collection
 * Get virtual account details for payment collection based on currency
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { searchParams } = new URL(request.url)
  const currency = searchParams.get("currency")
  const amount = searchParams.get("amount")
  const reference = searchParams.get("reference")

  if (!currency || !amount) {
    return createErrorResponse("currency and amount are required", 400)
  }

  try {
    const virtualAccount = await paymentCollectionService.getVirtualAccountDetails(
      currency,
      amount,
      reference || undefined,
    )

    return NextResponse.json({ virtualAccount })
  } catch (error: any) {
    console.error("Error getting payment collection details:", error)
    return createErrorResponse(
      `Failed to get payment collection details: ${error.message || "Unknown error"}`,
      500,
    )
  }
})


