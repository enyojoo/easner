import { type NextRequest, NextResponse } from "next/server"
import { cryptoWalletService, recipientService } from "@/lib/database"
import { supabase } from "@/lib/supabase"
import { cryptoReceiveService } from "@/lib/crypto-receive-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  const wallets = await cryptoWalletService.getAllByUser(user.id)
  return NextResponse.json({ wallets })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const {
    cryptoCurrency,
    fiatCurrency,
    recipientId,
    destinationType, // "bank" or "card"
    chain = "stellar", // Default to stellar, but can be "ethereum", etc.
    cardFirstName,
    cardLastName,
  } = await request.json()

  // Validate input
  if (!cryptoCurrency || !fiatCurrency) {
    return createErrorResponse("Missing required fields: cryptoCurrency and fiatCurrency", 400)
  }

  // Validate destination type
  if (!destinationType || !["bank", "card"].includes(destinationType)) {
    return createErrorResponse("destinationType must be 'bank' or 'card'", 400)
  }

  // Validate bank-specific fields
  if (destinationType === "bank" && !recipientId) {
    return createErrorResponse("recipientId is required for bank payouts", 400)
  }

  // Validate card-specific fields
  if (destinationType === "card" && (!cardFirstName || !cardLastName)) {
    return createErrorResponse("cardFirstName and cardLastName are required for card payouts", 400)
  }

  // Check if address already exists for this user/currency/destination combination
  // Note: Users can have multiple addresses for same currency if destination types differ
  const existingWallets = await cryptoWalletService.getAllByUser(user.id)
  const existing = existingWallets.find(
    (w) =>
      w.crypto_currency === cryptoCurrency &&
      w.destination_type === destinationType &&
      w.status === "active",
  )
  if (existing) {
    return createErrorResponse(
      `Address already exists for ${cryptoCurrency} with ${destinationType} destination`,
      409,
    )
  }

  try {
    // Get user profile for Bridge customer creation
    const { data: userProfile } = await supabase
      .from("users")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .single()

    // Prepare parameters for Bridge address creation
    const createParams: any = {
      userId: user.id,
      userEmail: userProfile?.email,
      userFirstName: userProfile?.first_name || "",
      userLastName: userProfile?.last_name || "",
      destinationType,
      chain,
      currency: cryptoCurrency.toLowerCase(), // e.g., "usdc", "eurc"
    }

    if (destinationType === "bank") {
      // Get recipient details for bank payout
      const recipients = await recipientService.getByUserId(user.id)
      const recipient = recipients.find((r) => r.id === recipientId)
      if (!recipient) {
        return createErrorResponse("Recipient not found", 404)
      }

      // Map recipient to Bridge external account format
      createParams.recipientId = recipientId
      createParams.recipientAccountNumber = recipient.account_number
      createParams.recipientBankName = recipient.bank_name
      createParams.recipientAccountHolderName = recipient.full_name
      createParams.recipientRoutingNumber = recipient.routing_number
      createParams.recipientIban = recipient.iban
      createParams.recipientSwiftBic = recipient.swift_bic
      createParams.destinationCurrency = fiatCurrency.toUpperCase() // USD, EUR
    } else {
      // Card payout
      createParams.cardFirstName = cardFirstName
      createParams.cardLastName = cardLastName
    }

    // Create Bridge address (Liquidation Address or Card Top-Up deposit address)
    const bridgeAddress = await cryptoReceiveService.createReceiveAddress(createParams)

    // Store in database
    const wallet = await cryptoWalletService.createBridgeAddress(user.id, {
      bridgeCustomerId: bridgeAddress.bridgeCustomerId,
      destinationType: bridgeAddress.destinationType,
      cryptoCurrency,
      fiatCurrency,
      chain,
      blockchainAddress: bridgeAddress.blockchainAddress,
      blockchainMemo: bridgeAddress.blockchainMemo,
      recipientId: destinationType === "bank" ? recipientId : undefined,
      bridgeLiquidationAddressId: bridgeAddress.liquidationAddressId,
      externalAccountId: bridgeAddress.externalAccountId,
      destinationPaymentRail: destinationType === "bank" ? "wire" : "card",
      destinationCurrency: fiatCurrency.toUpperCase(),
      bridgeCardAccountId: bridgeAddress.cardAccountId,
    })

    return NextResponse.json({
      wallet: {
        ...wallet,
        wallet_address: bridgeAddress.blockchainAddress,
        blockchain_address: bridgeAddress.blockchainAddress,
        blockchain_memo: bridgeAddress.blockchainMemo,
        destination_type: bridgeAddress.destinationType,
      },
    })
  } catch (error: any) {
    console.error("Error creating Bridge address:", error)
    return createErrorResponse(
      `Failed to create address: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

