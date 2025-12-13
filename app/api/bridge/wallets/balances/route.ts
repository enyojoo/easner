import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"

/**
 * GET /api/bridge/wallets/balances
 * Get wallet balances for the authenticated user (USD/EUR only)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log(`[BALANCES-API] ========== GET /api/bridge/wallets/balances CALLED ==========`)
  const user = await requireUser(request)
  console.log(`[BALANCES-API] User authenticated: ${user.id}, ${user.email}`)

  try {
    // Use server client to bypass RLS
    const supabase = createServerClient()
    
    // Get user's Bridge customer ID and wallet ID
    console.log(`[BALANCES-API] Fetching user profile from database...`)
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_wallet_id")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error(`[BALANCES-API] Error fetching user profile:`, profileError)
    }

    console.log(`[BALANCES-API] User profile:`, {
      hasCustomerId: !!userProfile?.bridge_customer_id,
      customerId: userProfile?.bridge_customer_id,
      hasWalletId: !!userProfile?.bridge_wallet_id,
      walletId: userProfile?.bridge_wallet_id,
    })

    if (!userProfile?.bridge_customer_id || !userProfile?.bridge_wallet_id) {
      console.log(`[BALANCES-API] Missing customer ID or wallet ID, returning zeros`)
      return NextResponse.json({
        USD: "0",
        EUR: "0",
      })
    }

    // Get wallet balance from Bridge (with timeout)
    let balances: any = {}
    try {
      console.log(`[BALANCES-API] Starting balance fetch for customer ${userProfile.bridge_customer_id}, wallet ${userProfile.bridge_wallet_id}`)
      balances = await Promise.race([
        bridgeService.getWalletBalance(userProfile.bridge_customer_id, userProfile.bridge_wallet_id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
      ]) as any
      
      console.log(`[BALANCES-API] ✅ Fetched balances for customer ${userProfile.bridge_customer_id}, wallet ${userProfile.bridge_wallet_id}:`, JSON.stringify(balances, null, 2))
      console.log(`[BALANCES-API] Balance type:`, typeof balances, `USD:`, balances.USD, `EUR:`, balances.EUR)
    } catch (error: any) {
      console.error(`[BALANCES-API] ❌ Error fetching wallet balance from Bridge:`, error.message)
      console.error(`[BALANCES-API] Error stack:`, error.stack)
      // Return zero balances on timeout or error
      return NextResponse.json({
        USD: "0",
        EUR: "0",
      })
    }

    // Return USD and EUR balances
    // getWalletBalance already maps usdb/usdc to USD and eurc to EUR and always returns USD/EUR keys
    return NextResponse.json({
      USD: balances.USD || "0",
      EUR: balances.EUR || "0",
    })
  } catch (error: any) {
    console.error("Error fetching wallet balances:", error)
    // Return zero balances on error
    return NextResponse.json({
      USD: "0",
      EUR: "0",
    })
  }
})

