import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/bridge/wallets/balances
 * Get wallet balances for the authenticated user (USD/EUR only)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    // Get user's Bridge wallet ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_wallet_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_wallet_id) {
      return NextResponse.json({
        USD: "0",
        EUR: "0",
      })
    }

    // Get wallet balance from Bridge (with timeout)
    let balances: any = {}
    try {
      balances = await Promise.race([
        bridgeService.getWalletBalance(userProfile.bridge_wallet_id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
      ]) as any
    } catch (error: any) {
      console.error("Error fetching wallet balance from Bridge:", error)
      // Return zero balances on timeout or error
      return NextResponse.json({
        USD: "0",
        EUR: "0",
      })
    }

    // Return USD and EUR balances
    // Bridge API returns balances as "usdb" (USDC on Solana) and "eurc" (EURC on Solana)
    // We map these to USD and EUR for display purposes
    return NextResponse.json({
      USD: balances.usdb || balances.usdc || "0", // Support both usdb and usdc keys
      EUR: balances.eurc || "0",
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

