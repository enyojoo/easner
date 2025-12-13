import { type NextRequest, NextResponse } from "next/server"
import { bridgeTransactionService } from "@/lib/bridge-transaction-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/bridge/transactions/:id
 * Get specific transaction details
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const user = await requireUser(request)
  const transactionId = params.id

  try {
    const transaction = await bridgeTransactionService.getTransactionById(transactionId)

    if (!transaction) {
      return createErrorResponse("Transaction not found", 404)
    }

    // Verify transaction belongs to user
    if (transaction.user_id !== user.id) {
      return createErrorResponse("Unauthorized", 403)
    }

    return NextResponse.json({ transaction })
  } catch (error: any) {
    console.error("Error fetching transaction:", error)
    return createErrorResponse(
      `Failed to fetch transaction: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

