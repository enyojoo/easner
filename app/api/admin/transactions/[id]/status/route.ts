// Admin transaction status update API endpoint

import { NextRequest, NextResponse } from "next/server"
import { transactionStatusService } from "@/lib/transaction-status-service"
import { requireAdmin } from "@/lib/admin-auth-utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)
    const transactionId = params.id
    const body = await request.json()

    const { status, failure_reason, reference, completed_at } = body

    if (!status) {
      return NextResponse.json({ 
        error: "Status is required" 
      }, { status: 400 })
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
