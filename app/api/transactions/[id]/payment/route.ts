// Get payment information for a specific transaction
// Returns payment details if payment was received via Bridge virtual account

import { type NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"

export const GET = withErrorHandling(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const user = await requireUser(request)
  
  if (!context?.params?.id) {
    return createErrorResponse("Transaction ID is required", 400)
  }
  
  const transactionId = context.params.id

  try {
    // Use server client for database queries
    const supabase = createServerClient()
    
    // First verify the transaction belongs to the user
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("id, transaction_id, user_id")
      .eq("transaction_id", transactionId.toUpperCase())
      .eq("user_id", user.id)
      .single()

    if (txError || !transaction) {
      return createErrorResponse("Transaction not found", 404)
    }

    // Get payment(s) for this transaction
    const { data: payments, error: paymentError } = await supabase
      .from("bridge_payments")
      .select("*")
      .eq("transaction_id", transaction.id)
      .order("created_at", { ascending: false })

    if (paymentError) {
      console.error("Error fetching payments:", paymentError)
      return createErrorResponse(
        `Failed to fetch payment information: ${paymentError.message}`,
        500,
      )
    }

    return NextResponse.json({
      hasPayment: payments && payments.length > 0,
      payments: payments || [],
      latestPayment: payments && payments.length > 0 ? payments[0] : null,
    })
  } catch (error: any) {
    console.error("Error fetching transaction payment:", error)
    return createErrorResponse(
      `Failed to fetch payment information: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

