import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const serverClient = createServerClient()
    const { data: users, error } = await serverClient
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    // Calculate transaction stats for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const { data: transactions } = await serverClient
          .from("transactions")
          .select("send_amount, send_currency, status")
          .eq("user_id", user.id)

        const totalTransactions = transactions?.length || 0
        const totalVolume = (transactions || []).reduce((sum, tx) => {
          let amount = Number(tx.send_amount)

          // Convert to NGN based on actual currency
          switch (tx.send_currency) {
            case "RUB":
              amount = amount * 0.011 // RUB to NGN rate
              break
            case "USD":
              amount = amount * 1650 // USD to NGN rate
              break
            case "EUR":
              amount = amount * 1750 // EUR to NGN rate
              break
            case "GBP":
              amount = amount * 2000 // GBP to NGN rate
              break
            case "NGN":
            default:
              // Already in NGN, no conversion needed
              break
          }

          return sum + amount
        }, 0)

        return {
          ...user,
          totalTransactions,
          totalVolume,
        }
      }),
    )

    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error("Error loading users:", error)
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}
