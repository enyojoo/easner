// Test endpoint for email service (development only)

import { NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { email, template } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    let result

    if (template === 'welcome') {
      result = await emailService.sendWelcomeEmail({
        firstName: 'Test',
        lastName: 'User',
        email: email,
        baseCurrency: 'USD',
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
      })
    } else if (template === 'transaction') {
      result = await emailService.sendTransactionCompletedEmail(email, {
        transactionId: 'ETID123456789',
        recipientName: 'John Doe',
        sendAmount: 100,
        sendCurrency: 'USD',
        receiveAmount: 150000,
        receiveCurrency: 'NGN',
        exchangeRate: 1500,
        fee: 0,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } else {
      result = await emailService.sendTestEmail(email)
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
