import { type NextRequest, NextResponse } from "next/server"
import { bridgeCardsService } from "@/lib/bridge-cards-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/cards/[id]
 * Get a specific card's details
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const user = await requireUser(request)

  try {
    // Verify card belongs to user
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (cardError || !card) {
      return createErrorResponse("Card not found", 404)
    }

    // Get latest card details from Bridge
    const cardAccount = await bridgeCardsService.getCardAccount(card.bridge_card_account_id)

    return NextResponse.json({
      card: {
        ...card,
        balance: parseFloat(cardAccount.balances.available.amount),
        currency: cardAccount.balances.available.currency.toUpperCase(),
        last4: cardAccount.card_details?.last_4 || card.card_number?.slice(-4) || "",
        expiry: cardAccount.card_details?.expiry || "",
        status: cardAccount.status,
        fundingAddress: cardAccount.funding_instructions?.address,
        fundingChain: cardAccount.funding_instructions?.chain,
        fundingCurrency: cardAccount.funding_instructions?.currency,
        cardholderName: cardAccount.cardholder_name,
        freezes: cardAccount.freezes,
      },
    })
  } catch (error: any) {
    console.error("Error fetching card:", error)
    return createErrorResponse(
      `Failed to fetch card: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

/**
 * PATCH /api/cards/[id]
 * Update card (freeze/unfreeze, etc.)
 */
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const user = await requireUser(request)
  const { action, ...updates } = await request.json()

  try {
    // Verify card belongs to user
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("bridge_card_account_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (cardError || !card) {
      return createErrorResponse("Card not found", 404)
    }

    // Handle freeze/unfreeze action
    if (action === "freeze" || action === "unfreeze") {
      // Bridge Cards API freeze/unfreeze would be called here
      // For now, we'll update the status in our database
      // In production, you'd call bridgeCardsService.freezeCard() or unfreezeCard()
      
      const { data: updatedCard, error: updateError } = await supabase
        .from("cards")
        .update({
          status: action === "freeze" ? "frozen" : "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single()

      if (updateError) throw updateError

      return NextResponse.json({ card: updatedCard })
    }

    // Handle other updates
    if (Object.keys(updates).length > 0) {
      const { data: updatedCard, error: updateError } = await supabase
        .from("cards")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single()

      if (updateError) throw updateError

      return NextResponse.json({ card: updatedCard })
    }

    return createErrorResponse("No action or updates provided", 400)
  } catch (error: any) {
    console.error("Error updating card:", error)
    return createErrorResponse(
      `Failed to update card: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

