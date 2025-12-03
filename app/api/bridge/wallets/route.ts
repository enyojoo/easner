import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/bridge/wallets
 * Get wallets for the authenticated user
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    // Get wallets from database
    const { data: wallets, error } = await supabase
      .from("bridge_wallets")
      .select("*")
      .eq("user_id", user.id)

    if (error) throw error

    // Fetch balances from Bridge for each wallet (with timeout)
    const walletsWithBalances = await Promise.all(
      (wallets || []).map(async (wallet) => {
        try {
          const balances = await Promise.race([
            bridgeService.getWalletBalance(wallet.bridge_wallet_id),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 8000)
            )
          ]) as any
          
          return {
            id: wallet.id,
            walletId: wallet.bridge_wallet_id,
            chain: wallet.chain,
            address: wallet.address,
            balances,
            status: wallet.status,
          }
        } catch (error) {
          console.error(`Error fetching balance for wallet ${wallet.id}:`, error)
          // Return wallet without balances on timeout/error
          return {
            id: wallet.id,
            walletId: wallet.bridge_wallet_id,
            chain: wallet.chain,
            address: wallet.address,
            balances: {},
            status: wallet.status,
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

/**
 * POST /api/bridge/wallets
 * Create a wallet for the authenticated user
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { chain = "solana" } = body

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

    // Create wallet
    const wallet = await bridgeService.createWallet(userProfile.bridge_customer_id, chain)

    // Store in database
    const { data: dbWallet, error } = await supabase
      .from("bridge_wallets")
      .insert({
        user_id: user.id,
        bridge_wallet_id: wallet.id,
        chain,
        address: wallet.address,
        status: wallet.status,
      })
      .select()
      .single()

    if (error) throw error

    // Update user record
    await supabase
      .from("users")
      .update({
        bridge_wallet_id: wallet.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    return NextResponse.json({
      id: dbWallet.id,
      walletId: wallet.id,
      chain,
      address: wallet.address,
      balances: wallet.balances || {},
      status: wallet.status,
    })
  } catch (error: any) {
    console.error("Error creating wallet:", error)
    return createErrorResponse(
      `Failed to create wallet: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

