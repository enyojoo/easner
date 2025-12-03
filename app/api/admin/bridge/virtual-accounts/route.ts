import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireAdmin, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/admin/bridge/virtual-accounts
 * List all Bridge virtual accounts (admin only)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAdmin(request)

  try {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get("currency")
    const status = searchParams.get("status")

    // Get virtual accounts from database
    let query = supabase
      .from("bridge_virtual_accounts")
      .select(`
        *,
        user:users(id, email, first_name, last_name)
      `)

    if (currency) {
      query = query.eq("currency", currency)
    }
    if (status) {
      query = query.eq("status", status)
    }

    const { data: virtualAccounts, error } = await query.order("created_at", {
      ascending: false,
    })

    if (error) throw error

    // Fetch latest details from Bridge for each account
    const accountsWithDetails = await Promise.all(
      (virtualAccounts || []).map(async (account) => {
        try {
          const bridgeAccount = await bridgeService.getVirtualAccountDetails(
            account.bridge_virtual_account_id,
          )
          return {
            ...account,
            bridgeDetails: bridgeAccount,
          }
        } catch (error) {
          console.error(
            `Error fetching virtual account ${account.bridge_virtual_account_id}:`,
            error,
          )
          return account
        }
      }),
    )

    return NextResponse.json({
      virtualAccounts: accountsWithDetails,
    })
  } catch (error: any) {
    console.error("Error fetching virtual accounts:", error)
    return createErrorResponse(
      `Failed to fetch virtual accounts: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

