import { type NextRequest, NextResponse } from "next/server"
import { bridgeCardsService } from "@/lib/bridge-cards-service"
import { bridgeCustomerService } from "@/lib/bridge-customer-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/cards
 * Get all cards for the authenticated user
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    // Get or create Bridge customer for user
    const { data: userProfile } = await supabase
      .from("users")
      .select("email, first_name, last_name, bridge_customer_id")
      .eq("id", user.id)
      .single()

    if (!userProfile) {
      return createErrorResponse("User profile not found", 404)
    }

    let bridgeCustomerId = userProfile.bridge_customer_id

    // Create Bridge customer if doesn't exist
    if (!bridgeCustomerId) {
      const customer = await bridgeCustomerService.createCustomer(user.id, {
        email: userProfile.email,
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
      })
      bridgeCustomerId = customer.id

      // Store Bridge customer ID in user profile
      await supabase
        .from("users")
        .update({ bridge_customer_id: bridgeCustomerId })
        .eq("id", user.id)
    }

    // Get all card accounts for this customer
    // Note: Bridge Cards API might have a list endpoint, but for now we'll get from database
    // and sync with Bridge
    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    // Fetch latest card details from Bridge for each card
    const cardsWithDetails = await Promise.all(
      (cards || []).map(async (card) => {
        try {
          const cardAccount = await bridgeCardsService.getCardAccount(card.bridge_card_account_id)
          return {
            ...card,
            balance: parseFloat(cardAccount.balances.available.amount),
            currency: cardAccount.balances.available.currency.toUpperCase(),
            last4: cardAccount.card_details?.last_4 || card.card_number?.slice(-4) || "",
            expiry: cardAccount.card_details?.expiry || "",
            status: cardAccount.status,
            fundingAddress: cardAccount.funding_instructions?.address,
            fundingChain: cardAccount.funding_instructions?.chain,
            fundingCurrency: cardAccount.funding_instructions?.currency,
          }
        } catch (error) {
          console.error(`Error fetching card ${card.id} from Bridge:`, error)
          return {
            ...card,
            balance: 0,
            currency: card.currency,
            last4: card.card_number?.slice(-4) || "",
            status: card.status,
          }
        }
      }),
    )

    return NextResponse.json({ cards: cardsWithDetails })
  } catch (error: any) {
    console.error("Error fetching cards:", error)
    return createErrorResponse(
      `Failed to fetch cards: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

/**
 * POST /api/cards
 * Create a new card account
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { chain, currency, firstName, lastName } = await request.json()

  if (!chain || !currency || !firstName || !lastName) {
    return createErrorResponse("Missing required fields: chain, currency, firstName, lastName", 400)
  }

  try {
    // Get or create Bridge customer
    const { data: userProfile } = await supabase
      .from("users")
      .select("email, first_name, last_name, bridge_customer_id")
      .eq("id", user.id)
      .single()

    if (!userProfile) {
      return createErrorResponse("User profile not found", 404)
    }

    let bridgeCustomerId = userProfile.bridge_customer_id

    if (!bridgeCustomerId) {
      const customer = await bridgeCustomerService.createCustomer(user.id, {
        email: userProfile.email,
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
      })
      bridgeCustomerId = customer.id

      await supabase
        .from("users")
        .update({ bridge_customer_id: bridgeCustomerId })
        .eq("id", user.id)
    }

    // Create card account with Top-Up funding strategy
    const cardAccount = await bridgeCardsService.createCardAccount(bridgeCustomerId, {
      chain,
      currency: currency.toLowerCase(),
      firstName,
      lastName,
      clientReferenceId: user.id,
    })

    // Store card in database
    const { data: card, error } = await supabase
      .from("cards")
      .insert({
        user_id: user.id,
        bridge_customer_id: bridgeCustomerId,
        bridge_card_account_id: cardAccount.id,
        card_number: cardAccount.card_details?.last_4 ? `****${cardAccount.card_details.last_4}` : null,
        currency: cardAccount.balances.available.currency.toUpperCase(),
        status: cardAccount.status,
        funding_address: cardAccount.funding_instructions?.address,
        funding_chain: cardAccount.funding_instructions?.chain,
        funding_currency: cardAccount.funding_instructions?.currency,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      card: {
        ...card,
        balance: parseFloat(cardAccount.balances.available.amount),
        last4: cardAccount.card_details?.last_4 || "",
        expiry: cardAccount.card_details?.expiry || "",
        fundingAddress: cardAccount.funding_instructions?.address,
        fundingChain: cardAccount.funding_instructions?.chain,
        fundingCurrency: cardAccount.funding_instructions?.currency,
      },
    })
  } catch (error: any) {
    console.error("Error creating card:", error)
    return createErrorResponse(
      `Failed to create card: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

