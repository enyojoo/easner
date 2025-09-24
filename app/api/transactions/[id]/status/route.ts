// Transaction status update API endpoint

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

    const transaction = await transactionStatusService.getTransaction(transactionId)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Check if user owns this transaction
    if (transaction.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Error fetching transaction status:", error)
    return NextResponse.json({ 
      error: "Failed to fetch transaction status" 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(request)
    const transactionId = params.id
    const body = await request.json()

    const { status, failure_reason, reference, completed_at } = body

    if (!status) {
      return NextResponse.json({ 
        error: "Status is required" 
      }, { status: 400 })
    }

    // Get transaction to verify ownership
    const transaction = await transactionStatusService.getTransaction(transactionId)
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const result = await transactionStatusService.updateStatus(transactionId, {
      status,
      failure_reason,
      reference,
      completed_at
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || "Failed to update status" 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      transaction: result.transaction 
    })
  } catch (error) {
    console.error("Error updating transaction status:", error)
    return NextResponse.json({ 
      error: "Failed to update transaction status" 
    }, { status: 500 })
  }
}
