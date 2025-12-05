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
 * 
 * Verification process per Bridge documentation:
 * 1. Parse signature header to extract timestamp and signature
 * 2. Check timestamp (reject if > 10 minutes old to prevent replay attacks)
 * 3. Create signed payload: timestamp.payload
 * 4. Create SHA256 digest: SHA256(signed_payload)
 * 5. Decode base64 signature
 * 6. Verify RSA signature: RSA.verify(public_key, digest, decoded_signature)
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
    const signatureParts = signatureHeader.split(',')
    const timestampPart = signatureParts.find(part => part.startsWith('t='))
    const signaturePart = signatureParts.find(part => part.startsWith('v0='))
    
    if (!timestampPart || !signaturePart) {
      console.warn("Invalid signature header format. Expected: t=<timestamp>,v0=<signature>")
      return false
    }

    const timestamp = timestampPart.split('=')[1]
    const base64Signature = signaturePart.split('=')[1]
    
    if (!timestamp || !base64Signature) {
      console.warn("Missing timestamp or signature in header")
      return false
    }
    
    // Check timestamp (reject events older than 10 minutes to prevent replay attacks)
    const currentTime = Date.now()
    const eventTime = parseInt(timestamp, 10)
    
    if (isNaN(eventTime)) {
      console.warn("[WEBHOOK-VERIFY] Invalid timestamp format")
      return false
    }
    
    const timeDiff = currentTime - eventTime
    const tenMinutes = 10 * 60 * 1000 // 10 minutes in milliseconds
    
    if (timeDiff > tenMinutes) {
      console.warn(`[WEBHOOK-VERIFY] Event timestamp too old: ${timeDiff}ms ago (max: ${tenMinutes}ms)`)
      return false
    }
    
    // Create signed payload: timestamp.payload
    const signedPayload = `${timestamp}.${payload}`
    
    // Normalize and format the public key
    let pemKey = publicKey.trim()
    
    // Remove any existing headers/footers to start fresh
    pemKey = pemKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/-----BEGIN RSA PUBLIC KEY-----/g, "")
      .replace(/-----END RSA PUBLIC KEY-----/g, "")
      .replace(/\s/g, "") // Remove all whitespace
    
    // Try PKCS#8 format first (standard format)
    let formattedKey = `-----BEGIN PUBLIC KEY-----\n${pemKey.match(/.{1,64}/g)?.join("\n") || pemKey}\n-----END PUBLIC KEY-----`
    
    // Decode the base64 signature
    let signatureBuffer: Buffer
    try {
      signatureBuffer = Buffer.from(base64Signature, "base64")
      if (signatureBuffer.length === 0) {
        console.warn("[WEBHOOK-VERIFY] Decoded signature buffer is empty")
        return false
      }
    } catch (decodeError: any) {
      console.error("[WEBHOOK-VERIFY] Error decoding base64 signature:", decodeError.message)
      return false
    }
    
    // Verify the RSA signature
    // Bridge signs: SHA256(timestamp.payload) with RSA private key
    // Per Bridge TypeScript example: Create SHA256 digest, then verify
    // Note: createVerify will hash the input, so we pass the digest directly
    const digest = crypto.createHash("sha256").update(signedPayload, "utf8").digest()
    
    let isValid = false
    try {
      // Try PKCS#8 format first (standard format)
      const verify = crypto.createVerify("RSA-SHA256")
      // Update with the digest (Bridge signs the hash, not the raw data)
      verify.update(digest)
      isValid = verify.verify(formattedKey, signatureBuffer)
      if (isValid) {
        console.log("[WEBHOOK-VERIFY] ✅ Signature verification successful")
      }
    } catch (verifyError: any) {
      // If PKCS#8 fails, try PKCS#1 format (RSA public key)
      if (verifyError.message?.includes("DECODER") || verifyError.message?.includes("unsupported")) {
        console.log("[WEBHOOK-VERIFY] Trying PKCS#1 format (RSA PUBLIC KEY)")
        try {
          formattedKey = `-----BEGIN RSA PUBLIC KEY-----\n${pemKey.match(/.{1,64}/g)?.join("\n") || pemKey}\n-----END RSA PUBLIC KEY-----`
          const verify2 = crypto.createVerify("RSA-SHA256")
          verify2.update(digest)
          isValid = verify2.verify(formattedKey, signatureBuffer)
          if (isValid) {
            console.log("[WEBHOOK-VERIFY] ✅ Signature verification successful (PKCS#1)")
          }
        } catch (pkcs1Error: any) {
          console.error("[WEBHOOK-VERIFY] Error verifying with PKCS#1 format:", pkcs1Error.message)
          // Try alternative: pass raw signedPayload (standard approach)
          try {
            const verify3 = crypto.createVerify("RSA-SHA256")
            verify3.update(signedPayload, "utf8")
            isValid = verify3.verify(formattedKey, signatureBuffer)
            if (isValid) {
              console.log("[WEBHOOK-VERIFY] ✅ Signature verification successful (standard approach)")
            }
          } catch (altError: any) {
            console.error("[WEBHOOK-VERIFY] Alternative verification also failed:", altError.message)
          return false
          }
        }
      } else {
        console.error("[WEBHOOK-VERIFY] Error verifying webhook signature:", verifyError.message)
        return false
      }
    }
    
    if (!isValid) {
      console.warn("[WEBHOOK-VERIFY] Signature verification failed - signature does not match")
    }
    
    return isValid
  } catch (error: any) {
    console.error("Error verifying webhook signature:", error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
    })
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
async function processWebhookEvent(
  eventType: string,
  eventObject: any,
  eventId?: string,
  metadata?: {
    eventCategory?: string
    eventObjectChanges?: any
    eventCreatedAt?: string
  }
) {
  try {
    // Handle different webhook event types
    // Support both new format (event_type) and legacy format
    switch (eventType) {
      case "liquidation_address.drain.created":
      case "liquidation_address.drain.updated":
      case "liquidation_address.drain.updated.status_transitioned":
      case "liquidation.completed":
      case "liquidation.processing":
      case "liquidation.failed": {
        // Liquidation address deposit (bank payouts)
        // Map new event structure to legacy format for compatibility
        const liquidationData = {
          id: eventObject.id,
          customer_id: eventObject.customer_id || eventObject.on_behalf_of,
          liquidation_address_id: eventObject.liquidation_address_id || eventObject.id,
          liquidation_id: eventObject.liquidation_id || eventObject.id,
          blockchain_tx_hash: eventObject.blockchain_tx_hash || eventObject.destination_tx_hash,
          blockchain_memo: eventObject.blockchain_memo,
          amount: eventObject.amount,
          currency: eventObject.currency,
          destination_currency: eventObject.destination_currency || eventObject.currency,
          status: eventObject.status || eventObject.state,
          created_at: eventObject.created_at,
          completed_at: eventObject.completed_at,
        }
        
        await receiveTransactionTracker.processLiquidationWebhook(liquidationData)
        
        // Store processed event
        const { data: liquidationUser } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", liquidationData.customer_id)
          .single()
        await storeProcessedEvent(eventId, eventType, eventObject, liquidationUser?.id)
        break
      }

      case "card_account.created":
      case "card_account.updated":
      case "card_account.updated.status_transitioned":
      case "card_account.balance_changed":
      case "card_account.funded": {
        // Card account events - handle balance changes and funding
        if (eventType.includes("balance_changed") || eventType.includes("funded")) {
        // Card top-up deposit (card payouts)
        await receiveTransactionTracker.processCardTopUpWebhook({
            id: eventObject.id,
            card_account_id: eventObject.card_account_id || eventObject.id,
            customer_id: eventObject.customer_id || eventObject.on_behalf_of,
            blockchain_tx_hash: eventObject.blockchain_tx_hash || eventObject.destination_tx_hash,
            amount: eventObject.amount,
            currency: eventObject.currency,
            status: eventObject.status || eventObject.state,
            created_at: eventObject.created_at,
        })
          
        // Store processed event
          const { data: cardUser } = await supabase
            .from("users")
            .select("id")
            .eq("bridge_customer_id", eventObject.customer_id || eventObject.on_behalf_of)
            .single()
          await storeProcessedEvent(eventId, eventType, eventObject, cardUser?.id)
        } else {
          // Other card account events - just log for now
          console.log(`[WEBHOOK] Card account event: ${eventType}`, eventObject.id)
          await storeProcessedEvent(eventId, eventType, eventObject, undefined)
        }
        break
      }

      case "card_transaction.created":
      case "card_transaction.updated":
      case "card_transaction.updated.status_transitioned": {
        // Card transaction events
        console.log(`[WEBHOOK] Card transaction event: ${eventType}`, eventObject.id)
        const customerId = eventObject.customer_id || eventObject.on_behalf_of
        const { data: cardUser } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()
        await storeProcessedEvent(eventId, eventType, eventObject, cardUser?.id)
        break
      }

      case "card_withdrawal.created":
      case "card_withdrawal.updated":
      case "card_withdrawal.updated.status_transitioned": {
        // Card withdrawal events
        console.log(`[WEBHOOK] Card withdrawal event: ${eventType}`, eventObject.id)
        const customerId = eventObject.customer_id || eventObject.on_behalf_of
        const { data: cardUser } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()
        await storeProcessedEvent(eventId, eventType, eventObject, cardUser?.id)
        break
      }

      case "posted_card_account_transaction.created": {
        // Posted card account transaction
        console.log(`[WEBHOOK] Posted card account transaction: ${eventType}`, eventObject.id)
        const customerId = eventObject.customer_id || eventObject.on_behalf_of
        const { data: cardUser } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()
        await storeProcessedEvent(eventId, eventType, eventObject, cardUser?.id)
        break
      }

      case "customer.created": {
        // New customer created
        console.log(`[WEBHOOK] Customer created: ${eventObject.id}`)
        const customerId = eventObject.id
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()
        await storeProcessedEvent(eventId, eventType, eventObject, user?.id)
        break
      }

      case "customer.updated":
      case "customer.updated.status_transitioned": {
        // Customer updated or KYC status changed
        const customerId = eventObject.id || eventObject.customer_id
        const newStatus = eventObject.kyc_status || eventObject.status

        // Find user by Bridge customer ID
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()

        if (user) {
          // Get full customer object to check endorsements and requirements
          let customerData: any = eventObject // Use event object if it has all data
          try {
            const { bridgeService } = await import("@/lib/bridge-service")
            customerData = await bridgeService.getCustomer(customerId)
          } catch (error) {
            console.error("[WEBHOOK] Error fetching customer for status update:", error)
            // Use event object as fallback
            customerData = eventObject
          }

          // Update KYC status in database
          const updateData: any = {
            updated_at: new Date().toISOString(),
          }

          if (newStatus) {
            updateData.bridge_kyc_status = newStatus
          }

          // Use rejection_reasons from customerData if available (more complete), otherwise from eventObject
          if (customerData?.rejection_reasons) {
            updateData.bridge_kyc_rejection_reasons = customerData.rejection_reasons
            console.log(`[WEBHOOK] Updated rejection_reasons from customer object:`, customerData.rejection_reasons)
          } else if (eventObject.rejection_reasons) {
            updateData.bridge_kyc_rejection_reasons = eventObject.rejection_reasons
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
              console.error("[WEBHOOK] Error completing account setup after KYC approval:", error)
            }
          }

          // Store processed event
          await storeProcessedEvent(eventId, eventType, eventObject, user.id)
        }
        break
      }

      case "customer.deleted": {
        // Customer deleted
        console.log(`[WEBHOOK] Customer deleted: ${eventObject.id}`)
        const customerId = eventObject.id
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()
        await storeProcessedEvent(eventId, eventType, eventObject, user?.id)
        break
      }

      case "customer.endorsement.updated":
      case "endorsement.updated": {
        // Endorsement status changed
        const customerId = eventObject.customer_id || eventObject.customer?.id || eventObject.id
        const endorsement = eventObject.endorsement || eventObject

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
              console.error("[WEBHOOK] Error completing account setup after endorsement approval:", error)
            }
          }

          // Store processed event
          await storeProcessedEvent(eventId, eventType, eventObject, user.id)
        }
        break
      }

      case "kyc_link.created":
      case "kyc_link.updated":
      case "kyc_link.updated.status_transitioned": {
        // KYC link events
        console.log(`[WEBHOOK] KYC link event: ${eventType}`, eventObject.id)
        const customerId = eventObject.customer_id
        
        if (customerId) {
          // First, try to find user by bridge_customer_id
          let user = await supabase
            .from("users")
            .select("id, bridge_customer_id")
            .eq("bridge_customer_id", customerId)
            .maybeSingle()
          
          // If not found by customer_id, try to find by email (in case customer_id wasn't stored yet)
          if (!user?.data?.id && eventObject.email) {
            console.log(`[WEBHOOK] User not found by customer_id, trying email: ${eventObject.email}`)
            const { data: userByEmail } = await supabase
              .from("users")
              .select("id, bridge_customer_id, email")
              .eq("email", eventObject.email)
              .maybeSingle()
            
            if (userByEmail?.id) {
              // Update customer_id if not set
              if (!userByEmail.bridge_customer_id) {
                await supabase
                  .from("users")
                  .update({ bridge_customer_id: customerId })
                  .eq("id", userByEmail.id)
                console.log(`[WEBHOOK] Stored bridge_customer_id for user ${userByEmail.id}`)
              }
              user = { data: userByEmail }
            }
          }
          
          if (user?.data?.id) {
            const userId = user.data.id
            
            // Update KYC status if available
            const updateData: any = {
              updated_at: new Date().toISOString(),
            }
            
            if (eventObject.kyc_status) {
              updateData.bridge_kyc_status = eventObject.kyc_status
              console.log(`[WEBHOOK] Updating KYC status to: ${eventObject.kyc_status}`)
            }
            
            // Update rejection reasons if available
            if (eventObject.rejection_reasons) {
              updateData.bridge_kyc_rejection_reasons = eventObject.rejection_reasons
            }
            
            // Update customer_id if not set
            if (!user.data.bridge_customer_id) {
              updateData.bridge_customer_id = customerId
            }
            
            await supabase
              .from("users")
              .update(updateData)
              .eq("id", userId)
            
            console.log(`[WEBHOOK] Updated user ${userId} with KYC status: ${eventObject.kyc_status || 'N/A'}`)
            
            // If KYC is completed (approved, under_review, or rejected), sync full data from Bridge
            if (eventObject.kyc_status && 
                (eventObject.kyc_status === "approved" || 
                 eventObject.kyc_status === "under_review" || 
                 eventObject.kyc_status === "rejected")) {
              try {
                const { syncBridgeKycDataToDatabase } = await import("@/lib/bridge-kyc-sync")
                await syncBridgeKycDataToDatabase(customerId, userId)
                console.log(`[WEBHOOK] Synced Bridge KYC data to database for user ${userId}`)
              } catch (syncError: any) {
                console.error(`[WEBHOOK] Error syncing Bridge KYC data:`, syncError)
                // Don't fail the webhook - logging is sufficient
              }
            }
            
            await storeProcessedEvent(eventId, eventType, eventObject, userId)
          } else {
            console.warn(`[WEBHOOK] User not found for customer_id ${customerId}, email: ${eventObject.email || 'N/A'}`)
            await storeProcessedEvent(eventId, eventType, eventObject, undefined)
          }
        } else {
          console.warn(`[WEBHOOK] KYC link event missing customer_id`)
          await storeProcessedEvent(eventId, eventType, eventObject, undefined)
        }
        break
      }

      case "virtual_account.activity.created":
      case "virtual_account.activity.updated": {
        // Deposit to virtual account - Payment received!
        // eventObject is the activity object in new format
        const activity = eventObject
        const virtualAccountId = activity.virtual_account_id || eventObject.virtual_account_id
        const activityId = activity.id

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
              eventObject, // Store full event data in metadata
            )

            // Attempt to match payment to transaction
            // Bridge payments may include a reference field that matches transaction ID
            const reference = activity.reference || activity.memo || activity.source?.description
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
          await storeProcessedEvent(eventId, eventType, eventObject, virtualAccount.user_id)
        } else {
          console.warn(`[BRIDGE-WEBHOOK] Virtual account not found: ${virtualAccountId}`)
        }
        break
      }

      case "transfer.created": {
        // New transfer created
        console.log(`[WEBHOOK] Transfer created: ${eventObject.id}`)
        const transferId = eventObject.id
        const customerId = eventObject.on_behalf_of
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()
        await storeProcessedEvent(eventId, eventType, eventObject, user?.id)
        break
      }

      case "transfer.updated":
      case "transfer.updated.status_transitioned": {
        // Transfer status changed
        const transferId = eventObject.id
        const newStatus = eventObject.state || eventObject.status

        // Update transfer status in database
        const { data: transfer } = await supabase
          .from("bridge_transfers")
          .select("user_id")
          .eq("bridge_transfer_id", transferId)
          .single()

        if (transfer) {
        await supabase
          .from("bridge_transfers")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("bridge_transfer_id", transferId)
        }

        // TODO: Send notification to user about transfer status change
        // Store processed event
        await storeProcessedEvent(eventId, eventType, eventObject, transfer?.user_id)
        break
      }

      case "wallet.balance_updated": {
        // Wallet balance changed
        const walletId = eventObject.wallet_id || eventObject.id
        // Balance updates are typically handled by polling, but we can log this
        console.log(`[WEBHOOK] Wallet balance updated: ${walletId}`)
        // Store processed event (no user_id needed for balance updates)
        await storeProcessedEvent(eventId, eventType, eventObject, undefined)
        break
      }

      case "static_memo.activity.created":
      case "static_memo.activity.updated": {
        // Static memo activity events
        console.log(`[WEBHOOK] Static memo activity: ${eventType}`, eventObject.id)
        await storeProcessedEvent(eventId, eventType, eventObject, undefined)
        break
      }

      default:
        console.log(`[WEBHOOK] Unhandled Bridge webhook event type: ${eventType}`)
        // Store unhandled events for debugging
        await storeProcessedEvent(eventId, eventType, eventObject, undefined)
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
    
    // Get the raw payload as text - this is what Bridge signed
    // CRITICAL: Must use the exact raw body, not parsed JSON
    const payload = await request.text()
    
    // Log signature header for debugging (without exposing full signature)
    if (signatureHeader) {
      const headerParts = signatureHeader.split(',')
      const timestampPart = headerParts.find(p => p.startsWith('t='))
      const signaturePart = headerParts.find(p => p.startsWith('v0='))
      console.log("[WEBHOOK] Signature header present:", {
        hasTimestamp: !!timestampPart,
        hasSignature: !!signaturePart,
        payloadLength: payload.length,
        payloadPreview: payload.substring(0, 100),
      })
    }
    
    const body = JSON.parse(payload)

    // Verify webhook signature
    if (BRIDGE_WEBHOOK_PUBLIC_KEY) {
      try {
        const isValid = verifyWebhookSignature(payload, signatureHeader, BRIDGE_WEBHOOK_PUBLIC_KEY)
        if (!isValid) {
          console.error("[WEBHOOK] ⚠️ Signature verification failed")
          // Reject invalid signatures in production
          if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
          }
          // Allow in development for debugging
          console.error("[WEBHOOK] ⚠️ ALLOWING WEBHOOK IN DEVELOPMENT - Signature verification failed")
        } else {
          console.log("[WEBHOOK] ✅ Signature verification successful")
        }
      } catch (verifyError: any) {
        console.error("[WEBHOOK] Error during signature verification:", verifyError.message)
        // Reject in production
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json({ error: "Signature verification error" }, { status: 401 })
        }
        // Allow in development for debugging
        console.error("[WEBHOOK] ⚠️ ALLOWING WEBHOOK IN DEVELOPMENT - Verification error")
      }
    } else {
      console.warn("[WEBHOOK] BRIDGE_WEBHOOK_PUBLIC_KEY not set - skipping signature verification")
      // In production, require signature verification
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Webhook verification not configured" }, { status: 500 })
      }
    }

    // Parse event structure - support both new Bridge format and legacy format
    // New Bridge format: event_type, event_category, event_object, event_id, event_created_at
    // Legacy format: type, data, id
    const eventType = body.event_type || body.type
    const eventCategory = body.event_category
    const eventObject = body.event_object || body.data || body
    const eventId = body.event_id || body.id || eventObject?.id
    const eventObjectChanges = body.event_object_changes
    const eventCreatedAt = body.event_created_at

    if (!eventType) {
      console.error("[WEBHOOK] Missing event_type in webhook payload")
      return NextResponse.json({ error: "Missing event_type" }, { status: 400 })
    }

    console.log("[WEBHOOK] Processing event:", {
      eventType,
      eventCategory,
      eventId,
      hasEventObject: !!eventObject,
      hasChanges: !!eventObjectChanges,
    })

    // Check idempotency - prevent duplicate processing
    const eventHash = crypto.createHash("sha256").update(JSON.stringify(eventObject)).digest("hex")
    const alreadyProcessed = await isEventProcessed(eventId, eventHash)
    
    if (alreadyProcessed) {
      console.log(`[WEBHOOK] Event already processed: ${eventType} (${eventId || eventHash})`)
      return NextResponse.json({ received: true, message: "Event already processed" })
    }

    // Return 200 immediately and process async
    processWebhookEvent(eventType, eventObject, eventId, {
      eventCategory,
      eventObjectChanges,
      eventCreatedAt,
    }).catch((error) => {
      console.error("[WEBHOOK] Error in async webhook processing:", error)
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


