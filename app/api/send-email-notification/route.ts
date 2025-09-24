// API endpoint to send email notifications (non-blocking)
// This can be called after successful transaction updates

import { NextRequest, NextResponse } from "next/server"
import { EmailNotificationService } from "@/lib/email-notification-service"

export async function POST(request: NextRequest) {
  try {
    const { transactionId, status, userEmail, firstName, type } = await request.json()

    if (type === 'transaction' && transactionId && status) {
      // Send transaction status email
      EmailNotificationService.sendTransactionStatusEmail(transactionId, status)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Transaction email notification queued' 
      })
    } else if (type === 'welcome' && userEmail && firstName) {
      // Send welcome email
      EmailNotificationService.sendWelcomeEmail(userEmail, firstName)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email notification queued' 
      })
    } else {
      return NextResponse.json({ 
        error: 'Invalid parameters' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Email notification API error:', error)
    return NextResponse.json({ 
      error: 'Failed to queue email notification' 
    }, { status: 500 })
  }
}
