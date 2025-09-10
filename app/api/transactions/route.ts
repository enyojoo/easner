import { type NextRequest, NextResponse } from "next/server"
import { transactionService, currencyService } from "@/lib/database"
import { createServerClient } from "@/lib/supabase"

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient()
  
  // Get the authorization header
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization header")
  }

  const token = authHeader.substring(7)
  
  // Verify the token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new Error("Invalid token")
  }

  // Check if user is an admin and block access to user APIs
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single()

  if (adminUser) {
    throw new Error("Admin users cannot access user APIs")
  }

  return user
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const transactions = await transactionService.getByUserId(user.id)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Get transactions error:", error)
    if (error.message === "Admin users cannot access user APIs") {
      return NextResponse.json({ error: "Access denied. Admin users cannot access user APIs." }, { status: 403 })
    }
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
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
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Create transaction error:", error)
    if (error.message === "Admin users cannot access user APIs") {
      return NextResponse.json({ error: "Access denied. Admin users cannot access user APIs." }, { status: 403 })
    }
    if (error.message === "Authentication required" || error.message === "Invalid token") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
