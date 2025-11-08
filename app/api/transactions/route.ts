import { type NextRequest, NextResponse } from "next/server"
import { transactionService, currencyService } from "@/lib/database"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { emailService } from "@/lib/email-service"
import { createServerClient } from "@/lib/supabase"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const transactions = await transactionService.getByUserId(user.id, 20, user.id)

  return NextResponse.json({ transactions })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { recipientId, sendAmount, sendCurrency, receiveCurrency } = await request.json()

  // Validate input
  if (!recipientId || !sendAmount || !sendCurrency || !receiveCurrency) {
    return createErrorResponse("Missing required fields", 400)
  }

  if (sendAmount <= 0) {
    return createErrorResponse("Send amount must be greater than 0", 400)
  }

    // Get exchange rate
    const rateData = await currencyService.getRate(sendCurrency, receiveCurrency)
    if (!rateData) {
    return createErrorResponse("Exchange rate not available", 400)
    }

    const receiveAmount = sendAmount * rateData.rate
    let feeAmount = 0

    // Calculate fee
    if (rateData.fee_type === "fixed") {
      feeAmount = rateData.fee_amount
    } else if (rateData.fee_type === "percentage") {
      feeAmount = (sendAmount * rateData.fee_amount) / 100
    }

    const totalAmount = sendAmount + feeAmount

    const transaction = await transactionService.create({
      userId: user.id,
      recipientId,
      sendAmount,
      sendCurrency,
      receiveAmount,
      receiveCurrency,
      exchangeRate: rateData.rate,
      feeAmount,
      feeType: rateData.fee_type,
      totalAmount,
  }, user.id)

    // Send initial pending status email (non-blocking)
    try {
      console.log('Sending initial pending email for transaction:', transaction.transaction_id)
      const { EmailNotificationService } = await import('@/lib/email-notification-service')
      await EmailNotificationService.sendTransactionStatusEmail(transaction.transaction_id, 'pending')
      console.log('Initial pending email sent successfully')
    } catch (emailError) {
      console.error('Failed to send initial transaction email:', emailError)
      // Don't fail the transaction creation if email fails
    }

    // Send admin notification email (non-blocking)
    // Simple notification - just transaction details, no user data fetching needed
    try {
      console.log('Sending admin notification for new transaction:', transaction.transaction_id)
      
      // Get recipient name only (we already have all transaction data)
      const supabase = createServerClient()
      const { data: recipientData } = await supabase
        .from('recipients')
        .select('full_name')
        .eq('id', recipientId)
        .single()
      
      // Create admin email data - just transaction info
      const adminEmailData = {
        transactionId: transaction.transaction_id,
        status: 'pending',
        sendAmount: transaction.send_amount,
        sendCurrency: transaction.send_currency,
        receiveAmount: transaction.receive_amount,
        receiveCurrency: transaction.receive_currency,
        exchangeRate: transaction.exchange_rate,
        fee: transaction.fee_amount,
        recipientName: recipientData?.full_name || 'Unknown',
        userId: transaction.user_id,
        userEmail: user.email || 'Unknown', // We already have user from requireUser
        userName: 'User', // Simple - admin can check dashboard for details
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
        failureReason: transaction.failure_reason
      }
      
      // Send email directly using emailService (exact same as early access)
      const adminEmailResult = await emailService.sendEmail({
        to: 'enyo@easner.com',
        template: 'adminTransactionNotification',
        data: adminEmailData
      })
      
      if (!adminEmailResult.success) {
        console.error('Failed to send admin email:', adminEmailResult.error)
      } else {
        console.log('Admin notification sent successfully!', adminEmailResult.messageId)
      }
    } catch (adminEmailError) {
      console.error('Error in admin email sending:', adminEmailError)
      // Don't fail the transaction creation if admin email fails
    }

    return NextResponse.json({ transaction })
})
