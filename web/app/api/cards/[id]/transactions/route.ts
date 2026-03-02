import { type NextRequest, NextResponse } from "next/server"
import { bridgeCardsService } from "@/lib/bridge-cards-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/cards/[id]/transactions
 * Get transactions for a specific card
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
      .select("bridge_card_account_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (cardError || !card) {
      return createErrorResponse("Card not found", 404)
    }

    // Get transactions from Bridge
    const transactions = await bridgeCardsService.getCardTransactions(card.bridge_card_account_id)

    return NextResponse.json({ transactions })
  } catch (error: any) {
    console.error("Error fetching card transactions:", error)
    return createErrorResponse(
      `Failed to fetch transactions: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

