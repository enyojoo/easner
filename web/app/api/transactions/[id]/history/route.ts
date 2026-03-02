// Transaction status history API endpoint

import { NextRequest, NextResponse } from "next/server"
import { transactionStatusService } from "@/lib/transaction-status-service"
import { requireUser } from "@/lib/auth-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(request)
    const transactionId = params.id

    // Verify transaction ownership
    const transaction = await transactionStatusService.getTransaction(transactionId)
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const history = await transactionStatusService.getStatusHistory(transactionId)

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    return NextResponse.json({ 
      error: "Failed to fetch transaction history" 
    }, { status: 500 })
  }
}
