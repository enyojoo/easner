import { type NextRequest, NextResponse } from "next/server"
import { bridgeLiquidationService } from "@/lib/bridge-liquidation-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"

/**
 * GET /api/bridge/liquidation-addresses?currency=usdc&chain=solana
 * Get liquidation addresses for the authenticated user
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { searchParams } = new URL(request.url)
  const currency = searchParams.get("currency") as string | null // e.g., "usdc", "eurc"
  const chain = searchParams.get("chain") as string | null // e.g., "solana"
  
  // Use server client to bypass RLS
  const supabase = createServerClient()

  try {
    // Get user's Bridge customer ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_wallet_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return NextResponse.json({
        hasAddress: false,
        currency: currency || undefined,
        chain: chain || undefined,
      })
    }

    // Fetch liquidation addresses from Bridge
    try {
      const liquidationAddresses = await bridgeLiquidationService.listLiquidationAddresses(
        userProfile.bridge_customer_id
      )

      // Filter by currency and chain if provided
      let filtered = liquidationAddresses
      if (currency) {
        filtered = filtered.filter((addr) => addr.currency.toLowerCase() === currency.toLowerCase())
      }
      if (chain) {
        filtered = filtered.filter((addr) => addr.chain.toLowerCase() === chain.toLowerCase())
      }

      // Find the one that matches our wallet (for wallet deposits)
      // Bridge returns destination_address for wallet deposits (not bridge_wallet_id)
      // Match by destination_payment_rail === chain (wallet deposits use the chain as payment rail)
      const walletDepositAddress = filtered.find(
        (addr) => addr.destination_payment_rail === chain?.toLowerCase() && 
                  addr.destination_currency === currency?.toLowerCase()
      )

      if (walletDepositAddress) {
        // Store/update in bridge_wallets table for fast retrieval
        if (userProfile.bridge_wallet_id) {
          const currency = walletDepositAddress.currency.toLowerCase()
          const updateData: any = {
            updated_at: new Date().toISOString(),
          }
          
          // Store liquidation address in wallet table based on currency
          if (currency === 'usdc') {
            updateData.usdc_liquidation_address = walletDepositAddress.address
            updateData.usdc_liquidation_memo = walletDepositAddress.blockchain_memo || null
            updateData.usdc_liquidation_address_id = walletDepositAddress.id
          } else if (currency === 'eurc') {
            updateData.eurc_liquidation_address = walletDepositAddress.address
            updateData.eurc_liquidation_memo = walletDepositAddress.blockchain_memo || null
            updateData.eurc_liquidation_address_id = walletDepositAddress.id
          }
          
          await supabase
            .from("bridge_wallets")
            .update(updateData)
            .eq("bridge_wallet_id", userProfile.bridge_wallet_id)
        }
        
        return NextResponse.json({
          hasAddress: true,
          currency: walletDepositAddress.currency,
          chain: walletDepositAddress.chain,
          address: walletDepositAddress.address, // This is the liquidation address
          memo: walletDepositAddress.blockchain_memo || null, // May not be present for Solana
          liquidationAddressId: walletDepositAddress.id,
        })
      }

      // No matching liquidation address found
      return NextResponse.json({
        hasAddress: false,
        currency: currency || undefined,
        chain: chain || undefined,
      })
    } catch (error: any) {
      console.error("Error fetching liquidation addresses from Bridge:", error)
      return NextResponse.json({
        hasAddress: false,
        currency: currency || undefined,
        chain: chain || undefined,
        error: error.message,
      })
    }
  } catch (error: any) {
    console.error("Error fetching liquidation addresses:", error)
    return createErrorResponse(
      `Failed to fetch liquidation addresses: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

/**
 * POST /api/bridge/liquidation-addresses
 * Create a liquidation address for the authenticated user
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { currency, chain } = body // e.g., currency: "usdc", chain: "solana"

  if (!currency || !chain) {
    return createErrorResponse("currency and chain are required", 400)
  }

  // Use server client to bypass RLS
  const supabase = createServerClient()

  try {
    // Get user's Bridge customer ID and wallet ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_wallet_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return createErrorResponse("User does not have a Bridge customer", 404)
    }

    if (!userProfile?.bridge_wallet_id) {
      return createErrorResponse("User does not have a Bridge wallet", 404)
    }

    // Create liquidation address pointing to the wallet
    const liquidationAddress = await bridgeLiquidationService.createLiquidationAddress(
      userProfile.bridge_customer_id,
      {
        chain: chain.toLowerCase(), // e.g., "solana"
        currency: currency.toLowerCase(), // e.g., "usdc"
        bridgeWalletId: userProfile.bridge_wallet_id,
        destinationPaymentRail: chain.toLowerCase(), // e.g., "solana"
        destinationCurrency: currency.toLowerCase(), // e.g., "usdc"
      }
    )

    // Store in bridge_wallets table for fast retrieval
    const currencyLower = currency.toLowerCase()
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    // Store liquidation address in wallet table based on currency
    if (currencyLower === 'usdc') {
      updateData.usdc_liquidation_address = liquidationAddress.address
      updateData.usdc_liquidation_memo = liquidationAddress.blockchain_memo || null
      updateData.usdc_liquidation_address_id = liquidationAddress.id
    } else if (currencyLower === 'eurc') {
      updateData.eurc_liquidation_address = liquidationAddress.address
      updateData.eurc_liquidation_memo = liquidationAddress.blockchain_memo || null
      updateData.eurc_liquidation_address_id = liquidationAddress.id
    }
    
    await supabase
      .from("bridge_wallets")
      .update(updateData)
      .eq("bridge_wallet_id", userProfile.bridge_wallet_id)

    return NextResponse.json({
      hasAddress: true,
      currency: liquidationAddress.currency,
      chain: liquidationAddress.chain,
      address: liquidationAddress.address,
      memo: liquidationAddress.blockchain_memo,
      liquidationAddressId: liquidationAddress.id,
    })
  } catch (error: any) {
    console.error("Error creating liquidation address:", error)
    return createErrorResponse(
      `Failed to create liquidation address: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

