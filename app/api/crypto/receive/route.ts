import { type NextRequest, NextResponse } from "next/server"
import { cryptoReceiveTransactionService } from "@/lib/database"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  const { searchParams } = new URL(request.url)
  const walletId = searchParams.get("walletId")
  const limit = parseInt(searchParams.get("limit") || "100")

  let transactions
  if (walletId) {
    transactions = await cryptoReceiveTransactionService.getByWallet(walletId)
  } else {
    transactions = await cryptoReceiveTransactionService.getByUser(user.id, limit)
  }

  return NextResponse.json({ transactions })
})

// POST endpoint removed - Stellar monitoring is no longer used
// Bridge handles transaction monitoring via webhooks

