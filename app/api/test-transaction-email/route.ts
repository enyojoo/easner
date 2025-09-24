// Test endpoint for transaction email notifications (development only)

import { NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { status, transactionId } = await request.json()

    if (!status) {
      return NextResponse.json({ 
        error: 'Status is required' 
      }, { status: 400 })
    }

    const testTransactionData = {
      transactionId: transactionId || 'ETID1758717725151',
      recipientName: 'John Doe',
      sendAmount: 100,
      sendCurrency: 'USD',
      receiveAmount: 150000,
      receiveCurrency: 'NGN',
      exchangeRate: 1500,
      fee: 0,
      status: status as any,
      failureReason: status === 'failed' ? 'Payment processing error' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let emailResult

    switch (status) {
      case 'pending':
        emailResult = await emailService.sendTransactionPendingEmail('enyocreative@gmail.com', testTransactionData)
        break
      case 'processing':
        emailResult = await emailService.sendTransactionProcessingEmail('enyocreative@gmail.com', testTransactionData)
        break
      case 'completed':
        emailResult = await emailService.sendTransactionCompletedEmail('enyocreative@gmail.com', testTransactionData)
        break
      case 'failed':
        emailResult = await emailService.sendTransactionFailedEmail('enyocreative@gmail.com', testTransactionData)
        break
      case 'cancelled':
        emailResult = await emailService.sendTransactionCancelledEmail('enyocreative@gmail.com', testTransactionData)
        break
      default:
        return NextResponse.json({ 
          error: 'Invalid status. Use: pending, processing, completed, failed, or cancelled' 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${status} email sent successfully`,
      emailResult: emailResult,
      transactionData: testTransactionData
    })
  } catch (error) {
    console.error('Test transaction email error:', error)
    return NextResponse.json({ 
      error: 'Failed to send transaction email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
