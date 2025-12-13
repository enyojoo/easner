import { type NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"
import { bridgeLiquidationService } from "@/lib/bridge-liquidation-service"

/**
 * POST /api/bridge/sync-liquidation-addresses
 * Sync existing liquidation addresses from Bridge to database
 * This is useful for users who already have liquidation addresses in Bridge
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const supabase = createServerClient()

  try {
    // Get user's Bridge customer ID and wallet ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_wallet_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return createErrorResponse("User does not have a Bridge customer ID", 404)
    }

    if (!userProfile?.bridge_wallet_id) {
      return createErrorResponse("User does not have a Bridge wallet", 404)
    }

    // Fetch all liquidation addresses from Bridge
    const liquidationAddresses = await bridgeLiquidationService.listLiquidationAddresses(
      userProfile.bridge_customer_id
    )

    console.log(`[SYNC-LIQUIDATION] Found ${liquidationAddresses.length} liquidation addresses in Bridge`)

    // Filter for wallet deposits (destination_payment_rail matches chain like solana, ethereum)
    const walletDepositAddresses = liquidationAddresses.filter(
      (addr) =>
        addr.destination_payment_rail &&
        (addr.destination_payment_rail === "solana" || addr.destination_payment_rail === "ethereum")
    )

    if (walletDepositAddresses.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No wallet deposit liquidation addresses found",
        synced: 0,
      })
    }

    // Update bridge_wallets table with liquidation addresses
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    let syncedCount = 0
    for (const addr of walletDepositAddresses) {
      const currency = addr.currency.toLowerCase()

      if (currency === "usdc") {
        updateData.usdc_liquidation_address = addr.address
        updateData.usdc_liquidation_memo = addr.blockchain_memo || null
        updateData.usdc_liquidation_address_id = addr.id
        syncedCount++
        console.log(`[SYNC-LIQUIDATION] Storing USDC liquidation address: ${addr.address}`)
      } else if (currency === "eurc") {
        updateData.eurc_liquidation_address = addr.address
        updateData.eurc_liquidation_memo = addr.blockchain_memo || null
        updateData.eurc_liquidation_address_id = addr.id
        syncedCount++
        console.log(`[SYNC-LIQUIDATION] Storing EURC liquidation address: ${addr.address}`)
      }
    }

    // Update the wallet record
    const { error } = await supabase
      .from("bridge_wallets")
      .update(updateData)
      .eq("bridge_wallet_id", userProfile.bridge_wallet_id)

    if (error) {
      console.error(`[SYNC-LIQUIDATION] Error updating bridge_wallets:`, error)
      throw error
    }

    console.log(`[SYNC-LIQUIDATION] ✅ Successfully synced ${syncedCount} liquidation addresses to database`)

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} liquidation address(es)`,
      synced: syncedCount,
      addresses: walletDepositAddresses.map((addr) => ({
        currency: addr.currency,
        chain: addr.chain,
        address: addr.address,
        memo: addr.blockchain_memo,
      })),
    })
  } catch (error: any) {
    console.error("[SYNC-LIQUIDATION] Error syncing liquidation addresses:", error)
    return createErrorResponse(
      `Failed to sync liquidation addresses: ${error.message || "Unknown error"}`,
      500
    )
  }
})

