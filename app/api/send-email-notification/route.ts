// API endpoint to send email notifications (non-blocking)
// This can be called after successful transaction updates

import { NextRequest, NextResponse } from "next/server"
import { EmailNotificationService } from "@/lib/email-notification-service"

export async function POST(request: NextRequest) {
  try {
    console.log('Email notification API: Received request')
    const { transactionId, status, userEmail, firstName, type } = await request.json()
    console.log('Email notification API: Request data:', { transactionId, status, userEmail, firstName, type })

    if (type === 'transaction' && transactionId && status) {
      console.log('Email notification API: Sending transaction status email')
      // Send transaction status email
      EmailNotificationService.sendTransactionStatusEmail(transactionId, status)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Transaction email notification queued' 
      })
    } else if (type === 'welcome' && userEmail && firstName) {
      console.log('Email notification API: Sending welcome email')
      // Send welcome email
      EmailNotificationService.sendWelcomeEmail(userEmail, firstName)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email notification queued' 
      })
    } else {
      console.log('Email notification API: Invalid parameters')
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
