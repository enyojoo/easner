// Test endpoint for email notifications (development only)

import { NextRequest, NextResponse } from "next/server"
import { EmailNotificationService } from "@/lib/email-notification-service"

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { type, email, transactionId, status } = await request.json()

    if (type === 'welcome' && email) {
      EmailNotificationService.sendWelcomeEmail(email, 'Test User')
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email queued' 
      })
    } else if (type === 'transaction' && transactionId && status) {
      EmailNotificationService.sendTransactionStatusEmail(transactionId, status)
      return NextResponse.json({ 
        success: true, 
        message: 'Transaction email queued' 
      })
    } else {
      return NextResponse.json({ 
        error: 'Invalid parameters. Use type: "welcome" with email, or type: "transaction" with transactionId and status' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Test email notification error:', error)
    return NextResponse.json({ 
      error: 'Failed to queue email notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
