import { type NextRequest, NextResponse } from "next/server"
import { transactionService, currencyService } from "@/lib/database"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const transactions = await transactionService.getByUserId(user.userId)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { recipientId, sendAmount, sendCurrency, receiveCurrency } = await request.json()

    // Get exchange rate
    const rateData = await currencyService.getRate(sendCurrency, receiveCurrency)
    if (!rateData) {
      return NextResponse.json({ error: "Exchange rate not available" }, { status: 400 })
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
      userId: user.userId,
      recipientId,
      sendAmount,
      sendCurrency,
      receiveAmount,
      receiveCurrency,
      exchangeRate: rateData.rate,
      feeAmount,
      feeType: rateData.fee_type,
      totalAmount,
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
