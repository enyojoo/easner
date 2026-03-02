import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { bridgeTransactionService } from "@/lib/bridge-transaction-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"
import { getWalletIdByUsername } from "@/lib/username-service"

/**
 * POST /api/bridge/transfers
 * Create a transfer (send transaction)
 * Supports: bank transfers, P2P (wallet-to-wallet), external crypto addresses
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const {
    amount,
    currency,
    sourceWalletId,
    destinationExternalAccountId,
    destinationWalletId,
    destinationCryptoAddress,
    destinationUsername, // @username for P2P
    destinationPaymentRail,
    recipientName,
    recipientId,
  } = body

  // Validate required fields
  if (!amount || !currency || !sourceWalletId) {
    return createErrorResponse(
      "Missing required fields: amount, currency, sourceWalletId",
      400,
    )
  }

  // Validate destination - must have at least one
  if (!destinationExternalAccountId && !destinationWalletId && !destinationCryptoAddress && !destinationUsername) {
    return createErrorResponse(
      "Missing destination: destinationExternalAccountId, destinationWalletId, destinationCryptoAddress, or destinationUsername",
      400,
    )
  }

  // If username provided, resolve to wallet ID
  let resolvedDestinationWalletId = destinationWalletId
  if (destinationUsername) {
    try {
      const usernameResult = await getWalletIdByUsername(destinationUsername)
      
      if (!usernameResult) {
        return createErrorResponse(
          `User with username ${destinationUsername} not found`,
          404,
        )
      }

      if (!usernameResult.bridgeWalletId) {
        return createErrorResponse(
          `User ${destinationUsername} does not have a wallet set up`,
          400,
        )
      }

      resolvedDestinationWalletId = usernameResult.bridgeWalletId
      
      // Use resolved user's name if recipientName not provided
      if (!recipientName && (usernameResult.firstName || usernameResult.lastName)) {
        const resolvedName = [usernameResult.firstName, usernameResult.lastName]
          .filter(Boolean)
          .join(" ")
        // Don't override if recipientName was explicitly provided
        if (!body.recipientName) {
          // We'll use this in the transaction creation
        }
      }
    } catch (error: any) {
      console.error("Error resolving username:", error)
      return createErrorResponse(
        `Failed to resolve username: ${error.message || "Unknown error"}`,
        500,
      )
    }
  }

  // Validate that we have a resolved destination
  if (!destinationExternalAccountId && !resolvedDestinationWalletId && !destinationCryptoAddress) {
    return createErrorResponse(
      "Could not resolve destination. Please check your input.",
      400,
    )
  }

  try {
    // Get user's Bridge customer ID
    const serverClient = createServerClient()
    const { data: userProfile } = await serverClient
      .from("users")
      .select("bridge_customer_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return createErrorResponse("User does not have a Bridge customer", 404)
    }

    // Determine destination payment rail
    let paymentRail = destinationPaymentRail
    if (!paymentRail) {
      if (destinationExternalAccountId) {
        paymentRail = "ach" // Default for bank transfers
      } else if (resolvedDestinationWalletId) {
        paymentRail = "bridge_wallet" // P2P
      } else if (destinationCryptoAddress) {
        // Infer from currency or default to solana
        paymentRail = currency.toLowerCase() === "usdc" || currency.toLowerCase() === "eurc" ? "solana" : "ethereum"
      }
    }

    // Create transfer via Bridge API
    const transfer = await bridgeService.createTransfer(userProfile.bridge_customer_id, {
      amount: amount.toString(),
      source: {
        payment_rail: "bridge_wallet",
        currency: currency.toLowerCase(),
        bridge_wallet_id: sourceWalletId,
      },
      destination: {
        payment_rail: paymentRail,
        currency: currency.toLowerCase(),
        ...(destinationExternalAccountId && { external_account_id: destinationExternalAccountId }),
        ...(resolvedDestinationWalletId && { bridge_wallet_id: resolvedDestinationWalletId }),
        ...(destinationCryptoAddress && { to_address: destinationCryptoAddress }),
      },
    })

    // Get recipient name for transaction record
    let finalRecipientName = recipientName
    if (destinationUsername && !finalRecipientName) {
      const usernameResult = await getWalletIdByUsername(destinationUsername)
      if (usernameResult && (usernameResult.firstName || usernameResult.lastName)) {
        finalRecipientName = [usernameResult.firstName, usernameResult.lastName]
          .filter(Boolean)
          .join(" ")
      } else if (usernameResult) {
        finalRecipientName = `@${usernameResult.easetag}`
      }
    }

    // Create transaction record IMMEDIATELY (ensures it appears in UI right away)
    // This is critical for CashApp/Revolut-like UX - transaction must appear instantly
    const transaction = await bridgeTransactionService.createSendTransaction({
      userId: user.id,
      bridgeTransferId: transfer.id,
      amount: parseFloat(transfer.amount),
      currency: transfer.currency,
      status: transfer.state || transfer.status || "awaiting_funds",
      sourceWalletId: transfer.source.bridge_wallet_id || sourceWalletId,
      sourcePaymentRail: transfer.source.payment_rail || "bridge_wallet",
      destinationPaymentRail: transfer.destination.payment_rail || paymentRail,
      destinationExternalAccountId: transfer.destination.external_account_id || destinationExternalAccountId,
      destinationWalletId: transfer.destination.bridge_wallet_id || resolvedDestinationWalletId,
      destinationCryptoAddress: transfer.destination.to_address || destinationCryptoAddress,
      recipientName: finalRecipientName,
      recipientId: recipientId,
      receiptFinalAmount: transfer.receipt?.final_amount ? parseFloat(transfer.receipt.final_amount) : undefined,
      receiptTraceNumber: transfer.receipt?.trace_number,
      receiptImad: transfer.receipt?.imad,
      receiptDestinationTxHash: transfer.receipt?.destination_tx_hash,
      metadata: {
        ...transfer,
        ...(destinationUsername && { destination_username: destinationUsername }),
      },
      bridgeCreatedAt: transfer.created_at,
    })

    console.log(`[BRIDGE-TRANSFER] ✅ Created transaction ${transaction.transaction_id} for transfer ${transfer.id} - will appear in UI immediately via real-time subscription`)

    return NextResponse.json({
      id: transfer.id,
      transaction_id: transaction.transaction_id,
      amount: transfer.amount,
      currency: transfer.currency,
      status: transfer.state || transfer.status,
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

