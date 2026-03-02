import { type NextRequest, NextResponse } from "next/server"
import { cryptoReceiveTransactionService } from "@/lib/database"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return withErrorHandling(async () => {
    const user = await requireUser(request)

    const transaction = await cryptoReceiveTransactionService.getByTransactionId(params.id)

    if (!transaction) {
      return createErrorResponse("Transaction not found", 404)
    }

    // Verify ownership
    if (transaction.user_id !== user.id) {
      return createErrorResponse("Access denied", 403)
    }

    return NextResponse.json({ transaction })
  })()
}

