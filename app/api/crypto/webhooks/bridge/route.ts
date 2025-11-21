// Bridge Webhook Handler
// Handles webhooks from Bridge for liquidation address deposits and card top-up events

import { NextRequest, NextResponse } from "next/server"
import { receiveTransactionTracker } from "@/lib/receive-transaction-tracker"

const BRIDGE_WEBHOOK_SECRET = process.env.BRIDGE_WEBHOOK_SECRET

/**
 * Verify webhook signature from Bridge
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  // This would typically use HMAC to verify the signature
  // For now, we'll do a simple check if secret is configured
  if (!secret) {
    console.warn("BRIDGE_WEBHOOK_SECRET is not set. Webhook verification is disabled.")
    return true // Allow in development
  }

  // TODO: Implement proper HMAC signature verification
  // const expectedSignature = crypto
  //   .createHmac("sha256", secret)
  //   .update(payload)
  //   .digest("hex")
  // return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))

  return true // Placeholder - implement proper verification
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-bridge-signature") || ""
    const payload = await request.text()
    const body = JSON.parse(payload)

    // Verify webhook signature
    if (BRIDGE_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(payload, signature, BRIDGE_WEBHOOK_SECRET)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const eventType = body.type || body.event_type
    const eventData = body.data || body

    // Handle different webhook event types
    switch (eventType) {
      case "liquidation.completed":
      case "liquidation.processing":
      case "liquidation.failed": {
        // Liquidation address deposit (bank payouts)
        await receiveTransactionTracker.processLiquidationWebhook({
          id: eventData.id,
          customer_id: eventData.customer_id,
          liquidation_address_id: eventData.liquidation_address_id,
          liquidation_id: eventData.liquidation_id || eventData.id,
          blockchain_tx_hash: eventData.blockchain_tx_hash,
          blockchain_memo: eventData.blockchain_memo,
          amount: eventData.amount,
          currency: eventData.currency,
          destination_currency: eventData.destination_currency,
          status: eventData.status,
          created_at: eventData.created_at,
          completed_at: eventData.completed_at,
        })
        break
      }

      case "card_account.balance_changed":
      case "card_account.funded": {
        // Card top-up deposit (card payouts)
        await receiveTransactionTracker.processCardTopUpWebhook({
          id: eventData.id,
          card_account_id: eventData.card_account_id,
          customer_id: eventData.customer_id,
          blockchain_tx_hash: eventData.blockchain_tx_hash,
          amount: eventData.amount,
          currency: eventData.currency,
          status: eventData.status,
          created_at: eventData.created_at,
        })
        break
      }

      default:
        console.log(`Unhandled Bridge webhook event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Bridge webhook:", error)
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 },
    )
  }
}

// GET endpoint for webhook verification (if Bridge requires it)
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("challenge")
  if (challenge) {
    return NextResponse.json({ challenge })
  }
  return NextResponse.json({ status: "ok" })
}


