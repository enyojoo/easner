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
    // Use same pattern as early access - call emailService.sendEmail() directly
    try {
      console.log('Sending admin notification for new transaction:', transaction.transaction_id)
      
      // Get user and recipient data
      const supabase = createServerClient()
      
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', user.id)
        .single()
      
      if (userError || !userData?.email) {
        console.error('Failed to fetch user data for admin email:', userError)
        throw new Error(`User not found or no email: ${userError?.message || 'No email address'}`)
      }
      
      // Get recipient data
      const { data: recipientData, error: recipientError } = await supabase
        .from('recipients')
        .select('full_name')
        .eq('id', recipientId)
        .single()
      
      // Create admin email data
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
        userEmail: userData.email,
        userName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unknown',
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
        failureReason: transaction.failure_reason
      }
      
      // Send email directly using emailService (like early access does)
      const adminEmailResult = await emailService.sendEmail({
        to: 'enyo@easner.com',
        template: 'adminTransactionNotification',
        data: adminEmailData
      })
      
      if (!adminEmailResult.success) {
        console.error('Failed to send admin email:', adminEmailResult.error)
        // Don't fail the transaction creation if admin email fails
      } else {
        console.log('Admin notification sent successfully!', adminEmailResult.messageId)
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification email:', adminEmailError)
      // Don't fail the transaction creation if admin email fails
    }

    return NextResponse.json({ transaction })
})
