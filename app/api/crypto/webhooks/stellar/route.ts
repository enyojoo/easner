import { type NextRequest, NextResponse } from "next/server"
import { stellarMonitorService } from "@/lib/stellar-monitor-service"
import { createServerClient } from "@/lib/supabase"

// Webhook endpoint for Stellar transaction monitoring
// This can be called by a cron job or external service
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if needed
    const webhookSecret = request.headers.get("x-webhook-secret")
    const expectedSecret = process.env.STELLAR_WEBHOOK_SECRET

    if (expectedSecret && webhookSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { walletId } = await request.json()

    if (walletId) {
      // Check specific wallet
      await stellarMonitorService.checkWalletForTransactions(walletId)
      return NextResponse.json({ success: true, message: `Checked wallet ${walletId}` })
    } else {
      // Check all wallets (would need implementation)
      await stellarMonitorService.checkAllWallets()
      return NextResponse.json({ success: true, message: "Checked all wallets" })
    }
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// GET endpoint for manual triggering (testing/admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletId = searchParams.get("walletId")

    if (walletId) {
      await stellarMonitorService.checkWalletForTransactions(walletId)
      return NextResponse.json({ success: true, message: `Checked wallet ${walletId}` })
    }

    return NextResponse.json({ error: "walletId parameter required" }, { status: 400 })
  } catch (error: any) {
    console.error("Error checking transactions:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

