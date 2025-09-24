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

    // Send initial pending status email
    try {
      const { transactionStatusService } = await import('@/lib/transaction-status-service')
      
      // Fetch the full transaction data with user and recipient info for email
      const fullTransaction = await transactionStatusService.getTransaction(transaction.transaction_id)
      if (fullTransaction) {
        await transactionStatusService.sendStatusNotification(fullTransaction, 'pending')
      }
    } catch (emailError) {
      console.error('Failed to send initial transaction email:', emailError)
      // Don't fail the transaction creation if email fails
    }

    return NextResponse.json({ transaction })
})
