import { type NextRequest, NextResponse } from "next/server"
import { cryptoWalletService } from "@/lib/database"
import { cryptoReceiveTransactionService } from "@/lib/database"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return withErrorHandling(async () => {
    const user = await requireUser(request)

    const wallet = await cryptoWalletService.getById(params.id)

    if (!wallet) {
      return createErrorResponse("Wallet not found", 404)
    }

    // Verify ownership
    if (wallet.user_id !== user.id) {
      return createErrorResponse("Access denied", 403)
    }

    // Get transaction history for this wallet
    const transactions = await cryptoReceiveTransactionService.getByWallet(params.id)

    return NextResponse.json({
      wallet: {
        ...wallet,
        transactions,
      },
    })
  })()
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return withErrorHandling(async () => {
    const user = await requireUser(request)

    const wallet = await cryptoWalletService.getById(params.id)

    if (!wallet) {
      return createErrorResponse("Wallet not found", 404)
    }

    // Verify ownership
    if (wallet.user_id !== user.id) {
      return createErrorResponse("Access denied", 403)
    }

    await cryptoWalletService.deactivate(params.id)

    return NextResponse.json({ success: true })
  })()
}

