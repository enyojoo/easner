import { type NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { syncAllTransactions } from "@/lib/bridge-transaction-sync"

/**
 * POST /api/bridge/sync-transactions
 * Manually trigger sync of historical transactions from Bridge API
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    console.log(`[SYNC-TX] Starting transaction sync for user ${user.id}`)
    
    const result = await syncAllTransactions(user.id)

    return NextResponse.json({
      success: true,
      depositsSynced: result.depositsSynced,
      liquidationDrainsSynced: result.liquidationDrainsSynced,
      transfersSynced: result.transfersSynced,
      totalSynced: result.depositsSynced + result.liquidationDrainsSynced + result.transfersSynced,
    })
  } catch (error: any) {
    console.error("Error syncing transactions:", error)
    return createErrorResponse(
      `Failed to sync transactions: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

