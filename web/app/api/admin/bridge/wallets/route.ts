import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireAdmin, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/admin/bridge/wallets
 * List all Bridge wallets (admin only)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAdmin(request)

  try {
    const { searchParams } = new URL(request.url)
    const chain = searchParams.get("chain")
    const currency = searchParams.get("currency")
    const status = searchParams.get("status")

    // Get wallets from database
    let query = supabase
      .from("bridge_wallets")
      .select(`
        *,
        user:users(id, email, first_name, last_name, bridge_customer_id)
      `)

    if (chain) {
      query = query.eq("chain", chain)
    }
    if (currency) {
      query = query.eq("currency", currency)
    }
    if (status) {
      query = query.eq("status", status)
    }

    const { data: wallets, error } = await query.order("created_at", {
      ascending: false,
    })

    if (error) throw error

    // Fetch balances from Bridge for each wallet
    const walletsWithBalances = await Promise.all(
      (wallets || []).map(async (wallet) => {
        try {
          // Get customer ID from user relationship
          const customerId = (wallet.user as any)?.bridge_customer_id
          if (!customerId) {
            console.warn(`No customer ID found for wallet ${wallet.bridge_wallet_id}`)
            return {
              ...wallet,
              balances: {},
            }
          }
          const balances = await bridgeService.getWalletBalance(customerId, wallet.bridge_wallet_id)
          return {
            ...wallet,
            balances,
          }
        } catch (error) {
          console.error(`Error fetching wallet balance ${wallet.bridge_wallet_id}:`, error)
          return {
            ...wallet,
            balances: {},
          }
        }
      }),
    )

    return NextResponse.json({
      wallets: walletsWithBalances,
    })
  } catch (error: any) {
    console.error("Error fetching wallets:", error)
    return createErrorResponse(
      `Failed to fetch wallets: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

