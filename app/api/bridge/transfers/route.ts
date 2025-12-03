import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * POST /api/bridge/transfers
 * Create a transfer from Bridge wallet to external bank account
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { amount, currency, sourceWalletId, destinationExternalAccountId } = body

  // Validate required fields
  if (!amount || !currency || !sourceWalletId || !destinationExternalAccountId) {
    return createErrorResponse(
      "Missing required fields: amount, currency, sourceWalletId, destinationExternalAccountId",
      400,
    )
  }

  if (currency !== "usd" && currency !== "eur") {
    return createErrorResponse("Currency must be 'usd' or 'eur'", 400)
  }

  try {
    // Get user's Bridge customer ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return createErrorResponse("User does not have a Bridge customer", 404)
    }

    // Create transfer
    const transfer = await bridgeService.createTransfer(userProfile.bridge_customer_id, {
      amount: amount.toString(),
      currency: currency.toLowerCase(),
      sourceWalletId,
      destinationExternalAccountId,
    })

    // Store in database
    await supabase.from("bridge_transfers").insert({
      user_id: user.id,
      bridge_transfer_id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      source_type: transfer.source.payment_rail,
      destination_type: transfer.destination.payment_rail,
      source_wallet_id: transfer.source.bridge_wallet_id,
      destination_external_account_id: transfer.destination.external_account_id,
      status: transfer.status,
    })

    return NextResponse.json({
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      status: transfer.status,
      source: transfer.source,
      destination: transfer.destination,
    })
  } catch (error: any) {
    console.error("Error creating transfer:", error)
    return createErrorResponse(
      `Failed to create transfer: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

