import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"

/**
 * POST /api/bridge/external-accounts
 * Create an external account (recipient's bank account)
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const {
    currency,
    account_type,
    account_owner_name,
    routing_number,
    account_number,
    iban,
    swift_bic,
    checking_or_savings,
    recipient_id, // Optional: link to existing recipient
  } = body

  // Validate required fields
  if (!currency || !account_type || !account_owner_name) {
    return createErrorResponse(
      "Missing required fields: currency, account_type, account_owner_name",
      400,
    )
  }

  // Validate account details based on account type
  if (account_type === "us" && (!routing_number || !account_number)) {
    return createErrorResponse("US accounts require routing_number and account_number", 400)
  }

  if (account_type === "euro" && !iban) {
    return createErrorResponse("Euro accounts require IBAN", 400)
  }

  try {
    // Get user's Bridge customer ID
    const serverClient = createServerClient()
    const { data: userProfile } = await serverClient
      .from("users")
      .select("bridge_customer_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return createErrorResponse("User does not have a Bridge customer", 404)
    }

    // Create external account via Bridge API
    const externalAccount = await bridgeService.createExternalAccount(userProfile.bridge_customer_id, {
      currency: currency.toLowerCase(),
      account_type: account_type,
      account_owner_name: account_owner_name,
      account: {
        ...(routing_number && { routing_number }),
        ...(account_number && { account_number }),
        ...(iban && { iban }),
        ...(swift_bic && { swift_bic }),
        ...(checking_or_savings && { checking_or_savings }),
      },
    })

    // If recipient_id provided, update recipient with external account ID
    if (recipient_id) {
      await serverClient
        .from("recipients")
        .update({
          bridge_external_account_id: externalAccount.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", recipient_id)
        .eq("user_id", user.id)
    }

    return NextResponse.json({
      id: externalAccount.id,
      currency: externalAccount.currency,
      account_type: externalAccount.account_type,
      account_owner_name: externalAccount.account_owner_name,
      status: externalAccount.status,
    })
  } catch (error: any) {
    console.error("Error creating external account:", error)
    return createErrorResponse(
      `Failed to create external account: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

/**
 * GET /api/bridge/external-accounts
 * List user's external accounts
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    // Get user's Bridge customer ID
    const serverClient = createServerClient()
    const { data: userProfile } = await serverClient
      .from("users")
      .select("bridge_customer_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.bridge_customer_id) {
      return createErrorResponse("User does not have a Bridge customer", 404)
    }

    // List external accounts from Bridge
    const externalAccounts = await bridgeService.listExternalAccounts(userProfile.bridge_customer_id)

    return NextResponse.json({
      external_accounts: externalAccounts,
      count: externalAccounts.length,
    })
  } catch (error: any) {
    console.error("Error fetching external accounts:", error)
    return createErrorResponse(
      `Failed to fetch external accounts: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

