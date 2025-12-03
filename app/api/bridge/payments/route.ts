// Bridge Payments API
// Get payment history and payment details

import { type NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { getPaymentHistory, getUnmatchedPayments } from "@/lib/bridge-payment-matcher"

/**
 * GET /api/bridge/payments
 * Get payment history for the authenticated user
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")
  const unmatchedOnly = searchParams.get("unmatched") === "true"

  try {
    if (unmatchedOnly) {
      const payments = await getUnmatchedPayments(user.id)
      return NextResponse.json({ payments })
    } else {
      const payments = await getPaymentHistory(user.id, limit)
      return NextResponse.json({ payments })
    }
  } catch (error: any) {
    console.error("Error fetching payment history:", error)
    return createErrorResponse(
      `Failed to fetch payment history: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

