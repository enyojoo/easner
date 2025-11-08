import { type NextRequest, NextResponse } from "next/server"
import { transactionService, currencyService } from "@/lib/database"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

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
    // Use exact same pattern as user email - call with transaction ID
    try {
      console.log('Sending admin notification for new transaction:', transaction.transaction_id)
      const { EmailNotificationService } = await import('@/lib/email-notification-service')
      await EmailNotificationService.sendAdminTransactionNotification(transaction.transaction_id, 'pending')
      console.log('Admin notification sent successfully')
    } catch (adminEmailError) {
      console.error('Failed to send admin notification email:', adminEmailError)
      // Don't fail the transaction creation if admin email fails
    }

    return NextResponse.json({ transaction })
})
