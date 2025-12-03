import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/bridge/virtual-accounts?currency=usd|eur
 * Get virtual account details for the authenticated user
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { searchParams } = new URL(request.url)
  const currency = searchParams.get("currency") as "usd" | "eur" | null

  try {
    // Get user's Bridge customer ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      // Return hasAccount: false instead of error - user needs to complete onboarding
      return NextResponse.json({
        hasAccount: false,
        currency: currency || undefined,
      })
    }

    // If currency specified, get that specific account
    if (currency) {
      const virtualAccountId =
        currency === "usd"
          ? userProfile.bridge_usd_virtual_account_id
          : userProfile.bridge_eur_virtual_account_id

      if (!virtualAccountId) {
        return NextResponse.json({
          hasAccount: false,
          currency,
        })
      }

      // Get from database first
      const { data: dbAccount } = await supabase
        .from("bridge_virtual_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("currency", currency)
        .single()

      if (dbAccount) {
        // Try to fetch latest from Bridge (with timeout), fallback to database
        try {
          const bridgeAccount = await Promise.race([
            bridgeService.getVirtualAccountDetails(virtualAccountId),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 8000)
            )
          ]) as any
          
          return NextResponse.json({
            hasAccount: true,
            currency,
            accountNumber: bridgeAccount.source_deposit_instructions?.bank_account_number,
            routingNumber: bridgeAccount.source_deposit_instructions?.bank_routing_number,
            iban: bridgeAccount.source_deposit_instructions?.iban,
            bic: bridgeAccount.source_deposit_instructions?.bic,
            bankName: bridgeAccount.source_deposit_instructions?.bank_name,
            accountHolderName: bridgeAccount.source_deposit_instructions?.account_holder_name || undefined,
            status: bridgeAccount.status,
          })
        } catch (error) {
          // Fallback to database data on timeout or error
          console.error("Error fetching virtual account from Bridge, using database data:", error)
          return NextResponse.json({
            hasAccount: true,
            currency,
            accountNumber: dbAccount.account_number,
            routingNumber: dbAccount.routing_number,
            iban: dbAccount.iban,
            bic: dbAccount.bic,
            bankName: dbAccount.bank_name,
            status: dbAccount.status,
          })
        }
      }

      return NextResponse.json({
        hasAccount: false,
        currency,
      })
    }

    // Get all virtual accounts from database (don't call Bridge API to avoid timeout)
    const { data: dbAccounts } = await supabase
      .from("bridge_virtual_accounts")
      .select("*")
      .eq("user_id", user.id)

    if (dbAccounts && dbAccounts.length > 0) {
    return NextResponse.json({
        accounts: dbAccounts.map((account) => ({
          id: account.bridge_virtual_account_id,
        currency: account.currency,
          accountNumber: account.account_number,
          routingNumber: account.routing_number,
          iban: account.iban,
          bic: account.bic,
          bankName: account.bank_name,
        status: account.status,
      })),
      })
    }

    // If no accounts in database, return empty array
    return NextResponse.json({
      accounts: [],
    })
  } catch (error: any) {
    console.error("Error fetching virtual accounts:", error)
    return createErrorResponse(
      `Failed to fetch virtual accounts: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

/**
 * POST /api/bridge/virtual-accounts
 * Create a virtual account for the authenticated user
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { currency, walletId } = body

  if (!currency || (currency !== "usd" && currency !== "eur")) {
    return createErrorResponse("Currency must be 'usd' or 'eur'", 400)
  }

  try {
    // Get user's Bridge customer ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_wallet_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return createErrorResponse("User does not have a Bridge customer", 404)
    }

    // Create virtual account
    const virtualAccount = await bridgeService.createVirtualAccount(
      userProfile.bridge_customer_id,
      currency,
      walletId || userProfile.bridge_wallet_id || undefined,
    )

    // Store in database
    await supabase.from("bridge_virtual_accounts").insert({
      user_id: user.id,
      bridge_virtual_account_id: virtualAccount.id,
      currency,
      account_number: virtualAccount.source_deposit_instructions?.bank_account_number,
      routing_number: virtualAccount.source_deposit_instructions?.bank_routing_number,
      iban: virtualAccount.source_deposit_instructions?.iban,
      bic: virtualAccount.source_deposit_instructions?.bic,
      bank_name: virtualAccount.source_deposit_instructions?.bank_name,
      status: virtualAccount.status,
    })

    // Update user record
    const updateField =
      currency === "usd" ? "bridge_usd_virtual_account_id" : "bridge_eur_virtual_account_id"
    await supabase
      .from("users")
      .update({
        [updateField]: virtualAccount.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    return NextResponse.json({
      id: virtualAccount.id,
      currency,
      accountNumber: virtualAccount.source_deposit_instructions?.bank_account_number,
      routingNumber: virtualAccount.source_deposit_instructions?.bank_routing_number,
      iban: virtualAccount.source_deposit_instructions?.iban,
      bic: virtualAccount.source_deposit_instructions?.bic,
      bankName: virtualAccount.source_deposit_instructions?.bank_name,
      status: virtualAccount.status,
    })
  } catch (error: any) {
    console.error("Error creating virtual account:", error)
    return createErrorResponse(
      `Failed to create virtual account: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

