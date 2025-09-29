// Debug endpoint for admin transaction status updates

import { NextRequest, NextResponse } from "next/server"
import { transactionStatusService } from "@/lib/transaction-status-service"
import { getAdminUser } from "@/lib/admin-auth-utils"

export async function POST(request: NextRequest) {
  try {
    console.log('Debug: Starting admin status update...')
    
    // Test admin auth
    const admin = await getAdminUser(request)
    console.log('Debug: Admin user:', admin ? 'Found' : 'Not found')
    
    if (!admin) {
      return NextResponse.json({ 
        error: "Admin authentication failed",
        details: "No admin user found"
      }, { status: 401 })
    }

    const body = await request.json()
    const { transactionId, status } = body

    console.log('Debug: Updating transaction:', transactionId, 'to status:', status)

    // Test transaction status update
    const result = await transactionStatusService.updateStatus(transactionId, {
      status: status || 'processing'
    })

    console.log('Debug: Status update result:', result)

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email },
      result
    })
  } catch (error) {
    console.error('Debug admin status error:', error)
    return NextResponse.json({ 
      error: 'Debug admin status failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
