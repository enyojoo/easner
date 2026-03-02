import { type NextRequest, NextResponse } from "next/server"
import { bridgeTransactionService } from "@/lib/bridge-transaction-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/bridge/transactions
 * Fetch all transactions (send + receive) for authenticated user
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as "send" | "receive" | null
  const status = searchParams.get("status")
  const currency = searchParams.get("currency")
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const transactions = await bridgeTransactionService.getTransactionsByUser(user.id, {
      type: type || undefined,
      status: status || undefined,
      currency: currency || undefined,
      limit,
      offset,
    })

    return NextResponse.json({
      transactions,
      count: transactions.length,
    })
  } catch (error: any) {
    console.error("Error fetching transactions:", error)
    return createErrorResponse(
      `Failed to fetch transactions: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

