// Test endpoint for transaction status updates (development only)

import { NextRequest, NextResponse } from "next/server"
import { transactionStatusService } from "@/lib/transaction-status-service"

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { transactionId, status, failure_reason } = await request.json()

    if (!transactionId || !status) {
      return NextResponse.json({ 
        error: 'Transaction ID and status are required' 
      }, { status: 400 })
    }

    const result = await transactionStatusService.updateStatus(transactionId, {
      status,
      failure_reason
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || "Failed to update status" 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${transactionId} status updated to ${status}`,
      transaction: result.transaction
    })
  } catch (error) {
    console.error('Test transaction status error:', error)
    return NextResponse.json({ 
      error: 'Failed to update transaction status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
