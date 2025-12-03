// Bridge Payment Matcher
// Matches incoming Bridge payments to transactions and updates transaction status

import { supabase } from "./supabase"

export interface BridgePayment {
  id: string
  user_id: string
  bridge_virtual_account_id: string
  bridge_activity_id: string
  amount: number
  currency: string
  transaction_id?: string
  matched: boolean
  status: string
  metadata: any
}

export interface PaymentMatchResult {
  matched: boolean
  transactionId?: string
  paymentId: string
}

/**
 * Store a payment received via Bridge virtual account
 */
export async function storeBridgePayment(
  userId: string,
  virtualAccountId: string,
  activityId: string,
  amount: number,
  currency: string,
  metadata: any,
): Promise<string> {
  console.log(`[BRIDGE-PAYMENT] Storing payment:`, {
    userId,
    virtualAccountId,
    activityId,
    amount,
    currency,
  })

  const { data, error } = await supabase
    .from("bridge_payments")
    .insert({
      user_id: userId,
      bridge_virtual_account_id: virtualAccountId,
      bridge_activity_id: activityId,
      amount: amount.toString(),
      currency: currency.toLowerCase(),
      status: "pending",
      matched: false,
      metadata,
    })
    .select("id")
    .single()

  if (error) {
    console.error(`[BRIDGE-PAYMENT] Error storing payment:`, error)
    throw new Error(`Failed to store payment: ${error.message}`)
  }

  console.log(`[BRIDGE-PAYMENT] Payment stored with ID: ${data.id}`)
  return data.id
}

/**
 * Match a payment to a transaction by reference/transaction ID
 * Bridge payments include a reference field that should match the transaction ID
 */
export async function matchPaymentToTransaction(
  paymentId: string,
  userId: string,
  amount: number,
  currency: string,
  reference?: string,
): Promise<PaymentMatchResult> {
  console.log(`[BRIDGE-PAYMENT] Attempting to match payment:`, {
    paymentId,
    userId,
    amount,
    currency,
    reference,
  })

  // First, try to match by reference (transaction_id field) if provided
  if (reference) {
    // Check if there's a transaction with this transaction_id
    const { data: transaction } = await supabase
      .from("transactions")
      .select("id, transaction_id, total_amount, send_currency, status")
      .eq("transaction_id", reference)
      .eq("user_id", userId)
      .single()

    if (transaction) {
      // Verify amount and currency match (with small tolerance for floating point)
      // total_amount is the amount user needs to pay
      const amountMatch = Math.abs(parseFloat(transaction.total_amount.toString()) - amount) < 0.01
      const currencyMatch = transaction.send_currency?.toLowerCase() === currency.toLowerCase()

      if (amountMatch && currencyMatch) {
        // Match found! Update payment and transaction
        await supabase
          .from("bridge_payments")
          .update({
            transaction_id: transaction.id,
            matched: true,
            matched_at: new Date().toISOString(),
            status: "matched",
          })
          .eq("id", paymentId)

        // Update transaction status to processing (payment received, now processing)
        await supabase
          .from("transactions")
          .update({
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.id)

        console.log(`[BRIDGE-PAYMENT] Payment matched to transaction: ${transaction.id}`)
        return {
          matched: true,
          transactionId: transaction.id,
          paymentId,
        }
      }
    }
  }

  // If no match by reference, try to match by amount and currency
  // This is a fallback - less reliable but might catch some cases
  const { data: pendingTransactions } = await supabase
    .from("transactions")
    .select("id, transaction_id, total_amount, send_currency, status")
    .eq("user_id", userId)
    .eq("send_currency", currency.toUpperCase())
    .in("status", ["pending"])
    .order("created_at", { ascending: false })
    .limit(10)

  if (pendingTransactions && pendingTransactions.length > 0) {
    for (const transaction of pendingTransactions) {
      const amountMatch = Math.abs(parseFloat(transaction.total_amount.toString()) - amount) < 0.01
      if (amountMatch) {
        // Potential match - update payment and transaction
        await supabase
          .from("bridge_payments")
          .update({
            transaction_id: transaction.id,
            matched: true,
            matched_at: new Date().toISOString(),
            status: "matched",
          })
          .eq("id", paymentId)

        await supabase
          .from("transactions")
          .update({
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.id)

        console.log(`[BRIDGE-PAYMENT] Payment matched to transaction by amount: ${transaction.id}`)
        return {
          matched: true,
          transactionId: transaction.id,
          paymentId,
        }
      }
    }
  }

  // No match found
  console.log(`[BRIDGE-PAYMENT] No transaction match found for payment: ${paymentId}`)
  return {
    matched: false,
    paymentId,
  }
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(userId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from("bridge_payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`[BRIDGE-PAYMENT] Error fetching payment history:`, error)
    throw new Error(`Failed to fetch payment history: ${error.message}`)
  }

  return data || []
}

/**
 * Get unmatched payments for a user
 */
export async function getUnmatchedPayments(userId: string) {
  const { data, error } = await supabase
    .from("bridge_payments")
    .select("*")
    .eq("user_id", userId)
    .eq("matched", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`[BRIDGE-PAYMENT] Error fetching unmatched payments:`, error)
    throw new Error(`Failed to fetch unmatched payments: ${error.message}`)
  }

  return data || []
}

