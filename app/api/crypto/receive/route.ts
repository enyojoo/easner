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

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { walletId } = await request.json()

  if (!walletId) {
    return createErrorResponse("walletId is required", 400)
  }

  // Manually trigger transaction check (for admin/testing)
  // This would typically be done by a background job
  try {
    const { stellarMonitorService } = await import("@/lib/stellar-monitor-service")
    await stellarMonitorService.checkWalletForTransactions(walletId)
    return NextResponse.json({ success: true, message: "Transaction check triggered" })
  } catch (error: any) {
    console.error("Error checking transactions:", error)
    return createErrorResponse(`Failed to check transactions: ${error.message}`, 500)
  }
})

