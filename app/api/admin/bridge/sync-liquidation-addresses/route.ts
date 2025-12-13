import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"
import { bridgeLiquidationService } from "@/lib/bridge-liquidation-service"

/**
 * POST /api/admin/bridge/sync-liquidation-addresses
 * Admin endpoint to sync liquidation addresses for any user
 * Body: { userId?: string, userEmail?: string }
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireAdmin(request)
  const supabase = createServerClient()
  const body = await request.json()
  const { userId, userEmail } = body

  if (!userId && !userEmail) {
    return createErrorResponse("userId or userEmail is required", 400)
  }

  try {
    // Get user by ID or email
    let query = supabase.from("users").select("id, email, bridge_customer_id, bridge_wallet_id")
    
    if (userId) {
      query = query.eq("id", userId)
    } else {
      query = query.eq("email", userEmail)
    }
    
    const { data: userProfile, error: userError } = await query.single()

    if (userError || !userProfile) {
      return createErrorResponse("User not found", 404)
    }

    if (!userProfile.bridge_customer_id) {
      return createErrorResponse("User does not have a Bridge customer ID", 404)
    }

    if (!userProfile.bridge_wallet_id) {
      return createErrorResponse("User does not have a Bridge wallet", 404)
    }

    // Fetch all liquidation addresses from Bridge
    const liquidationAddresses = await bridgeLiquidationService.listLiquidationAddresses(
      userProfile.bridge_customer_id
    )

    console.log(`[ADMIN-SYNC-LIQUIDATION] Found ${liquidationAddresses.length} liquidation addresses in Bridge for user ${userProfile.email}`)

    // Filter for wallet deposits
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
        console.log(`[ADMIN-SYNC-LIQUIDATION] Storing USDC liquidation address: ${addr.address}`)
      } else if (currency === "eurc") {
        updateData.eurc_liquidation_address = addr.address
        updateData.eurc_liquidation_memo = addr.blockchain_memo || null
        updateData.eurc_liquidation_address_id = addr.id
        syncedCount++
        console.log(`[ADMIN-SYNC-LIQUIDATION] Storing EURC liquidation address: ${addr.address}`)
      }
    }

    // Update the wallet record
    const { error: updateError } = await supabase
      .from("bridge_wallets")
      .update(updateData)
      .eq("bridge_wallet_id", userProfile.bridge_wallet_id)

    if (updateError) {
      console.error(`[ADMIN-SYNC-LIQUIDATION] Error updating bridge_wallets:`, updateError)
      throw updateError
    }

    console.log(`[ADMIN-SYNC-LIQUIDATION] ✅ Successfully synced ${syncedCount} liquidation addresses to database`)

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} liquidation address(es) for ${userProfile.email}`,
      synced: syncedCount,
      addresses: walletDepositAddresses.map((addr) => ({
        currency: addr.currency,
        chain: addr.chain,
        address: addr.address,
        memo: addr.blockchain_memo,
      })),
    })
  } catch (error: any) {
    console.error("[ADMIN-SYNC-LIQUIDATION] Error syncing liquidation addresses:", error)
    return createErrorResponse(
      `Failed to sync liquidation addresses: ${error.message || "Unknown error"}`,
      500
    )
  }
})

