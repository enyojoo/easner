// Bridge Webhook Handler
// Handles webhooks from Bridge for liquidation address deposits, card top-up events,
// customer KYC status updates, virtual account activity, transfers, and endorsements

import { NextRequest, NextResponse } from "next/server"
import { receiveTransactionTracker } from "@/lib/receive-transaction-tracker"
import { supabase } from "@/lib/supabase"
import { completeAccountSetupAfterKYC } from "@/lib/bridge-onboarding-service"
import crypto from "crypto"

const BRIDGE_WEBHOOK_PUBLIC_KEY = process.env.BRIDGE_WEBHOOK_SECRET || process.env.BRIDGE_WEBHOOK_PUBLIC_KEY

/**
 * Verify webhook signature from Bridge using RSA public key
 * Bridge uses RSA-SHA256 signature verification with format: t=<timestamp>,v0=<base64-signature>
 * The signed payload is: timestamp.raw_body
 */
function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  publicKey: string,
): boolean {
  if (!publicKey) {
    console.warn("BRIDGE_WEBHOOK_SECRET/BRIDGE_WEBHOOK_PUBLIC_KEY is not set. Webhook verification is disabled.")
    return true // Allow in development
  }

  if (!signatureHeader) {
    console.warn("Webhook signature header is missing.")
    return false
  }

  try {
    // Parse signature header: t=<timestamp>,v0=<base64-signature>
    const timestampMatch = signatureHeader.match(/t=([^,]+)/)
    const signatureMatch = signatureHeader.match(/v0=([^,]+)/)
    
    if (!timestampMatch || !signatureMatch) {
      console.warn("Invalid signature header format. Expected: t=<timestamp>,v0=<signature>")
      return false
    }

    const timestamp = timestampMatch[1]
    const base64Signature = signatureMatch[1]
    
    // Create signed payload: timestamp.raw_body
    const signedPayload = `${timestamp}.${payload}`
    
    // Ensure the public key has proper PEM format
    let pemKey = publicKey.trim()
    if (!pemKey.includes("BEGIN PUBLIC KEY")) {
      // If it's just the key without headers, add them
      pemKey = `-----BEGIN PUBLIC KEY-----\n${pemKey.replace(/\s/g, "")}\n-----END PUBLIC KEY-----`
    } else {
      // Ensure proper line breaks (handle both \n and \\n)
      pemKey = pemKey.replace(/\\n/g, "\n")
    }
    
    // Decode the base64 signature
    const signatureBuffer = Buffer.from(base64Signature, "base64")
    
    // Verify the signature using RSA public key
    // Bridge signs: SHA256(timestamp.raw_body) with RSA
    const verify = crypto.createVerify("RSA-SHA256")
    verify.update(signedPayload)
    verify.end()
    
    const isValid = verify.verify(pemKey, signatureBuffer)
    
    if (!isValid) {
      console.warn("Webhook signature verification failed")
    }
    
    return isValid
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
async function isEventProcessed(
  eventId: string | undefined,
  eventHash: string,
): Promise<boolean> {
  if (eventId) {
    const { data } = await supabase
      .from("bridge_webhook_events")
      .select("id")
      .eq("event_id", eventId)
      .single()
    if (data) return true
  }

  // Also check by hash
  const { data } = await supabase
    .from("bridge_webhook_events")
    .select("id")
    .eq("event_hash", eventHash)
    .single()
  return !!data
}

/**
 * Store processed webhook event for idempotency
 */
async function storeProcessedEvent(
  eventId: string | undefined,
  eventType: string,
  eventData: any,
  userId: string | undefined,
): Promise<void> {
  const eventHash = crypto.createHash("sha256").update(JSON.stringify(eventData)).digest("hex")
  const customerId = eventData.customer_id || eventData.id

  await supabase.from("bridge_webhook_events").insert({
    event_id: eventId || null,
    event_type: eventType,
    customer_id: customerId || null,
    user_id: userId || null,
    event_hash: eventHash,
  })
      }

/**
 * Process webhook event asynchronously
 */
async function processWebhookEvent(eventType: string, eventData: any, eventId?: string) {
  try {
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
        // Store processed event
        const { data: liquidationUser } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", eventData.customer_id)
          .single()
        await storeProcessedEvent(eventId, eventType, eventData, liquidationUser?.id)
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
        // Store processed event
        const { data: cardUser } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", eventData.customer_id)
          .single()
        await storeProcessedEvent(eventId, eventType, eventData, cardUser?.id)
        break
      }

      case "customer.updated.status_transitioned": {
        // Customer KYC status changed
        const customerId = eventData.customer_id || eventData.id
        const newStatus = eventData.status || eventData.kyc_status

        // Find user by Bridge customer ID
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()

        if (user) {
          // Get full customer object to check endorsements and requirements
          let customerData: any = null
          try {
            const { bridgeService } = await import("@/lib/bridge-service")
            customerData = await bridgeService.getCustomer(customerId)
          } catch (error) {
            console.error("Error fetching customer for status update:", error)
          }

          // Update KYC status in database
          const updateData: any = {
            bridge_kyc_status: newStatus,
            bridge_kyc_rejection_reasons: eventData.rejection_reasons || null,
            updated_at: new Date().toISOString(),
          }

          // Update endorsements if available
          if (customerData?.endorsements) {
            updateData.bridge_endorsements = customerData.endorsements
            console.log(`[WEBHOOK] Updated endorsements from customer object:`, customerData.endorsements)
          }

          await supabase
            .from("users")
            .update(updateData)
            .eq("id", user.id)

          // Log missing requirements if endorsements are incomplete
          if (customerData?.endorsements) {
            for (const endorsement of customerData.endorsements) {
              if (endorsement.status !== 'approved' && endorsement.requirements?.missing) {
                console.log(`[WEBHOOK] Endorsement ${endorsement.name} missing requirements:`, endorsement.requirements.missing)
              }
            }
          }

          // If KYC is approved, complete account setup (create wallet/virtual accounts if needed)
          if (newStatus === "approved") {
            try {
              await completeAccountSetupAfterKYC(user.id)
            } catch (error) {
              console.error("Error completing account setup after KYC approval:", error)
            }
          }

          // Store processed event
          await storeProcessedEvent(eventId, eventType, eventData, user.id)
        }
        break
      }

      case "customer.endorsement.updated":
      case "endorsement.updated": {
        // Endorsement status changed
        const customerId = eventData.customer_id || eventData.customer?.id
        const endorsement = eventData.endorsement || eventData

        // Find user by Bridge customer ID
        const { data: user } = await supabase
          .from("users")
          .select("id, bridge_endorsements")
          .eq("bridge_customer_id", customerId)
          .single()

        if (user) {
          // Update endorsements in database
          const currentEndorsements = (user.bridge_endorsements as any) || {}
          currentEndorsements[endorsement.name] = {
            status: endorsement.status,
            requirements: endorsement.requirements,
          }

          await supabase
            .from("users")
            .update({
              bridge_endorsements: currentEndorsements,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

          // If endorsement is approved, create virtual account if it doesn't exist
          if (endorsement.status === "approved") {
            try {
              await completeAccountSetupAfterKYC(user.id)
            } catch (error) {
              console.error("Error completing account setup after endorsement approval:", error)
            }
          }

          // Store processed event
          await storeProcessedEvent(eventId, eventType, eventData, user.id)
        }
        break
      }

      case "virtual_account.activity.created": {
        // Deposit to virtual account - Payment received!
        const virtualAccountId = eventData.virtual_account_id || eventData.id
        const activity = eventData.activity || eventData
        const activityId = activity.id || eventData.id

        // Find virtual account and user
        const { data: virtualAccount } = await supabase
          .from("bridge_virtual_accounts")
          .select("user_id, currency")
          .eq("bridge_virtual_account_id", virtualAccountId)
          .single()

        if (virtualAccount) {
          console.log(
            `[BRIDGE-WEBHOOK] Payment received: ${virtualAccountId}, User: ${virtualAccount.user_id}, Amount: ${activity.amount} ${activity.currency}`,
          )

          try {
            // Store payment in database
            const { storeBridgePayment, matchPaymentToTransaction } = await import("@/lib/bridge-payment-matcher")
            
            const paymentId = await storeBridgePayment(
              virtualAccount.user_id,
              virtualAccountId,
              activityId,
              parseFloat(activity.amount),
              activity.currency || virtualAccount.currency,
              eventData, // Store full event data in metadata
            )

            // Attempt to match payment to transaction
            // Bridge payments may include a reference field that matches transaction ID
            const reference = activity.reference || activity.memo || eventData.reference
            const matchResult = await matchPaymentToTransaction(
              paymentId,
              virtualAccount.user_id,
              parseFloat(activity.amount),
              activity.currency || virtualAccount.currency,
              reference,
            )

            if (matchResult.matched) {
              console.log(`[BRIDGE-WEBHOOK] Payment matched to transaction: ${matchResult.transactionId}`)
              // TODO: Send notification to user about payment received
            } else {
              console.log(`[BRIDGE-WEBHOOK] Payment not matched - will need manual review: ${paymentId}`)
              // TODO: Create notification for unmatched payment
            }
          } catch (paymentError: any) {
            console.error(`[BRIDGE-WEBHOOK] Error processing payment:`, paymentError.message)
            // Don't throw - log error but don't fail webhook processing
          }

          // Store processed event
          await storeProcessedEvent(eventId, eventType, eventData, virtualAccount.user_id)
        } else {
          console.warn(`[BRIDGE-WEBHOOK] Virtual account not found: ${virtualAccountId}`)
        }
        break
      }

      case "transfer.updated.status_transitioned": {
        // Transfer status changed
        const transferId = eventData.transfer_id || eventData.id
        const newStatus = eventData.status

        // Update transfer status in database
        const { data: transfer } = await supabase
          .from("bridge_transfers")
          .select("user_id")
          .eq("bridge_transfer_id", transferId)
          .single()

        await supabase
          .from("bridge_transfers")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("bridge_transfer_id", transferId)

        // TODO: Send notification to user about transfer status change
        // Store processed event
        await storeProcessedEvent(eventId, eventType, eventData, transfer?.user_id)
        break
      }

      case "wallet.balance_updated": {
        // Wallet balance changed
        const walletId = eventData.wallet_id || eventData.id
        // Balance updates are typically handled by polling, but we can log this
        console.log(`Wallet balance updated: ${walletId}`)
        // Store processed event (no user_id needed for balance updates)
        await storeProcessedEvent(eventId, eventType, eventData, undefined)
        break
      }

      default:
        console.log(`Unhandled Bridge webhook event type: ${eventType}`)
    }

  } catch (error) {
    console.error("Error processing Bridge webhook event:", error)
    // Don't throw - errors are logged but don't affect webhook response
  }
}

export async function POST(request: NextRequest) {
  try {
    // Bridge uses X-Webhook-Signature header with format: t=<timestamp>,v0=<base64-signature>
    // Also check x-bridge-signature for backward compatibility
    const signatureHeader = request.headers.get("x-webhook-signature") || 
                           request.headers.get("x-bridge-signature") || 
                           ""
    const payload = await request.text()
    const body = JSON.parse(payload)

    // Verify webhook signature
    if (BRIDGE_WEBHOOK_PUBLIC_KEY) {
      const isValid = verifyWebhookSignature(payload, signatureHeader, BRIDGE_WEBHOOK_PUBLIC_KEY)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const eventType = body.type || body.event_type
    const eventData = body.data || body
    const eventId = body.id || eventData.id

    // Check idempotency - prevent duplicate processing
    const eventHash = crypto.createHash("sha256").update(JSON.stringify(eventData)).digest("hex")
    const alreadyProcessed = await isEventProcessed(eventId, eventHash)
    
    if (alreadyProcessed) {
      console.log(`Webhook event already processed: ${eventType} (${eventId || eventHash})`)
      return NextResponse.json({ received: true, message: "Event already processed" })
    }

    // Return 200 immediately and process async
    processWebhookEvent(eventType, eventData, eventId).catch((error) => {
      console.error("Error in async webhook processing:", error)
    })

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


