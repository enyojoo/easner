// Bridge Webhook Handler
// Handles webhooks from Bridge for liquidation address deposits, card top-up events,
// customer KYC status updates, virtual account activity, transfers, and endorsements

import { NextRequest, NextResponse } from "next/server"
import { receiveTransactionTracker } from "@/lib/receive-transaction-tracker"
import { supabase } from "@/lib/supabase"
import { completeAccountSetupAfterKYC } from "@/lib/bridge-onboarding-service"
import { bridgeTransactionService } from "@/lib/bridge-transaction-service"
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
  const processStartTime = Date.now()
  console.log(`[WEBHOOK-PROCESS] 🚀 Starting to process ${eventType} at ${new Date().toISOString()}`)
  
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
        // Liquidation address deposit (crypto deposits like USDC that convert to USD in wallet)
        const customerId = eventObject.customer_id || eventObject.on_behalf_of
        const liquidationAddressId = eventObject.liquidation_address_id || eventObject.id
        
        // Get user ID from customer ID
        const { data: liquidationUser } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()
        
        if (!liquidationUser?.id) {
          console.warn(`[BRIDGE-WEBHOOK] User not found for customer: ${customerId}`)
          break
        }

        // Get liquidation address details to determine if it's a wallet deposit
        const { data: liquidationAddress } = await supabase
          .from("bridge_wallets")
          .select("bridge_wallet_id, usdc_liquidation_address_id, eurc_liquidation_address_id")
          .eq("user_id", liquidationUser.id)
          .single()

        // Determine if this is a wallet deposit (USDC/EURC -> USD/EUR conversion)
        const isWalletDeposit = liquidationAddress && (
          liquidationAddress.usdc_liquidation_address_id === liquidationAddressId ||
          liquidationAddress.eurc_liquidation_address_id === liquidationAddressId
        )

        if (isWalletDeposit) {
          // This is a crypto deposit (USDC/EURC) that converts to fiat (USD/EUR) in wallet
          // Map currency: USDC -> USD, EURC -> EUR
          const sourceCurrency = (eventObject.currency || '').toLowerCase()
          const destinationCurrency = (eventObject.destination_currency || sourceCurrency).toLowerCase()
          const displayCurrency = destinationCurrency === 'usdc' ? 'usd' : 
                                 destinationCurrency === 'eurc' ? 'eur' : 
                                 destinationCurrency

          // Check if transaction already exists
          const existing = await bridgeTransactionService.getTransactionByBridgeId(eventObject.id)
          
          if (existing) {
            // Update existing transaction if status changed
            const newStatus = eventObject.status || eventObject.state || 'processing'
            if (existing.status !== newStatus) {
              await bridgeTransactionService.updateTransactionStatus(
                eventObject.id,
                newStatus,
                {
                  receiptDestinationTxHash: eventObject.blockchain_tx_hash || eventObject.destination_tx_hash,
                  completedAt: (newStatus === 'completed' || newStatus === 'payment_processed') ? eventObject.completed_at : undefined,
                  metadata: eventObject,
                }
              )
            }
          } else {
            // Create new deposit transaction for liquidation drain
            await bridgeTransactionService.createDepositTransaction({
              userId: liquidationUser.id,
              bridgeActivityId: eventObject.id,
              liquidationAddressId: liquidationAddressId, // Liquidation address deposit
              amount: parseFloat(eventObject.amount),
              currency: displayCurrency, // Show as USD/EUR, not USDC/EURC
              status: eventObject.status || eventObject.state || 'processing',
              sourcePaymentRail: sourceCurrency === 'usdc' || sourceCurrency === 'eurc' ? 'solana' : 'ethereum', // Assume Solana for now
              receiptDestinationTxHash: eventObject.blockchain_tx_hash || eventObject.destination_tx_hash,
              reference: eventObject.blockchain_memo,
              metadata: {
                ...eventObject,
                source_currency: sourceCurrency,
                destination_currency: destinationCurrency,
                liquidation_address_id: liquidationAddressId,
                liquidation_id: eventObject.liquidation_id,
              },
              bridgeCreatedAt: eventObject.created_at,
            })
            console.log(`[BRIDGE-WEBHOOK] Created liquidation drain deposit transaction: ${eventObject.id} (${sourceCurrency} -> ${displayCurrency})`)
          }
        } else {
          // Legacy bank payout liquidation - keep old handler for now
          const liquidationData = {
            id: eventObject.id,
            customer_id: customerId,
            liquidation_address_id: liquidationAddressId,
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
        }
        
        // Store processed event
        await storeProcessedEvent(eventId, eventType, eventObject, liquidationUser.id)
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
              // Pass customerId directly (we already have it from the event at line 361)
              await completeAccountSetupAfterKYC(user.id, customerId)
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
              // Pass customerId from event to avoid re-querying
              await completeAccountSetupAfterKYC(user.id, customerId)
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
              // Use the userByEmail directly since we have the data
              const userId = userByEmail.id
              
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
              if (!userByEmail.bridge_customer_id) {
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
        console.log(`[BRIDGE-WEBHOOK] 🚀 Processing virtual_account.activity event at ${new Date().toISOString()}`)
        // eventObject is the activity object in new format
        const activity = eventObject
        const virtualAccountId = activity.virtual_account_id || eventObject.virtual_account_id
        const activityId = activity.id

        const activityType = activity.type || activity.status || ''
        const activityAmount = parseFloat(activity.amount || '0')
        const activityStatus = activityType || activity.status || 'funds_received'
        
        // Filter out non-transaction activities (same as sync logic)
        const nonTransactionTypes = [
          'account_update',
          'deactivation',
          'reactivation',
          'microdeposit',
        ]
        
        if (nonTransactionTypes.includes(activityType)) {
          console.log(`[BRIDGE-WEBHOOK] ⏭️ Skipping non-transaction activity: ${activityType}`)
          await storeProcessedEvent(eventId, eventType, eventObject, undefined)
          break
        }
        
        // Only process activities with positive amount
        if (activityAmount <= 0) {
          console.log(`[BRIDGE-WEBHOOK] ⏭️ Skipping activity with zero/negative amount: ${activityAmount}`)
          await storeProcessedEvent(eventId, eventType, eventObject, undefined)
          break
        }
        
        // Only process two statuses: funds_received (Processing) and payment_processed (Completed)
        // Skip all intermediate statuses (funds_scheduled, payment_submitted, in_review, etc.)
        const validStatuses = ['funds_received', 'payment_processed']
        if (!validStatuses.includes(activityStatus.toLowerCase())) {
          console.log(`[BRIDGE-WEBHOOK] ⏭️ Skipping activity ${activityId} with status ${activityStatus} (only tracking funds_received and payment_processed)`)
          await storeProcessedEvent(eventId, eventType, eventObject, virtualAccount?.user_id)
          break
        }

        console.log(`[BRIDGE-WEBHOOK] Activity details:`, {
          activityId,
          virtualAccountId,
          type: activityType,
          amount: activityAmount,
          currency: activity.currency,
          created_at: activity.created_at,
        })

        // Find virtual account and user
        const { data: virtualAccount, error: vaError } = await supabase
          .from("bridge_virtual_accounts")
          .select("user_id, currency")
          .eq("bridge_virtual_account_id", virtualAccountId)
          .single()

        if (vaError) {
          console.error(`[BRIDGE-WEBHOOK] ❌ Error finding virtual account:`, vaError)
        }

        if (virtualAccount) {
          console.log(
            `[BRIDGE-WEBHOOK] ✅ Deposit received: ${virtualAccountId}, User: ${virtualAccount.user_id}, Amount: ${activity.amount} ${activity.currency}, creating transaction NOW at ${new Date().toISOString()}`,
          )

          let transactionCreated = false
          try {
            // Create or update deposit transaction
            const { bridgeTransactionService } = await import("@/lib/bridge-transaction-service")
            
            // Normalize currency: usdc -> USD, eurc -> EUR
            const normalizeCurrency = (curr: string): string => {
              const lower = (curr || '').toLowerCase()
              if (lower === 'usdc' || lower === 'usd') return 'USD'
              if (lower === 'eurc' || lower === 'eur') return 'EUR'
              return curr?.toUpperCase() || virtualAccount.currency
            }
            
            const activityCurrency = normalizeCurrency(activity.currency || virtualAccount.currency)
            const activityStatus = activity.type || activity.status || 'funds_received'
            
            // Only track two statuses: funds_received (Processing) and payment_processed (Completed)
            const STATUS_HIERARCHY: Record<string, number> = {
              'funds_received': 1, // Processing
              'payment_processed': 2, // Completed
            }
            
            const getStatusPriority = (status: string): number => {
              return STATUS_HIERARCHY[status.toLowerCase()] || 0
            }
            
            const isStatusForward = (currentStatus: string, newStatus: string): boolean => {
              const currentPriority = getStatusPriority(currentStatus)
              const newPriority = getStatusPriority(newStatus)
              return newPriority > currentPriority
            }
            
            // PRIMARY: Check by deposit_id first (most reliable for grouping same transaction)
            let existing = null
            if (activity.deposit_id) {
              const { data } = await supabase
                .from('bridge_transactions')
                .select('*')
                .eq('deposit_id', activity.deposit_id)
                .eq('user_id', virtualAccount.user_id)
                .eq('transaction_type', 'receive')
                .maybeSingle()
              
              if (data) {
                existing = data
                console.log(`[BRIDGE-WEBHOOK] Found existing transaction by deposit_id ${activity.deposit_id}: ${existing.transaction_id}`)
              }
            }
            
            // FALLBACK: Check by bridge_transaction_id (activity.id)
            if (!existing) {
              existing = await bridgeTransactionService.getTransactionByBridgeId(activityId)
            }
            
            if (existing) {
              // Transaction exists - only update if status moves forward
              const statusChanged = existing.status !== activityStatus
              const statusIsForward = isStatusForward(existing.status, activityStatus)
              const hasNewReceiptInfo = activity.receipt?.final_amount || activity.receipt?.destination_tx_hash
              
              if ((statusChanged && statusIsForward) || hasNewReceiptInfo) {
                if (statusChanged && statusIsForward) {
                  console.log(`[BRIDGE-WEBHOOK] ✅ Updating transaction ${existing.transaction_id} status: ${existing.status} → ${activityStatus}`)
                } else if (statusChanged && !statusIsForward) {
                  console.log(`[BRIDGE-WEBHOOK] ⏭️ Skipping backward status update: ${existing.status} → ${activityStatus} (keeping ${existing.status})`)
                } else {
                  console.log(`[BRIDGE-WEBHOOK] ✅ Updating transaction ${existing.transaction_id} receipt info`)
                }
                
                // Only update status if it's forward progress
                const statusToUpdate = statusIsForward ? activityStatus : existing.status
                
                await bridgeTransactionService.updateTransactionStatus(
                  existing.transaction_id, // Use transaction_id (internal ID) to update the same row
                  statusToUpdate,
                  {
                    receiptFinalAmount: activity.receipt?.final_amount ? parseFloat(activity.receipt.final_amount) : undefined,
                    receiptDestinationTxHash: activity.receipt?.destination_tx_hash,
                    completedAt: activityStatus === 'payment_processed' ? new Date().toISOString() : undefined,
                    metadata: eventObject,
                    activityId: activityId, // Update activity_id and bridge_transaction_id to latest activity.id
                  },
                )
                console.log(`[BRIDGE-WEBHOOK] ✅ Updated deposit transaction: ${existing.transaction_id}`)
                transactionCreated = true
              } else {
                console.log(`[BRIDGE-WEBHOOK] ⏭️ Transaction ${existing.transaction_id} already at status ${existing.status}, no update needed`)
                transactionCreated = true // Mark as created since it exists
              }
            } else {
              // Create new deposit transaction (on first status - funds_scheduled, funds_received, etc.)
              // BUT FIRST: Double-check by deposit_id to prevent race conditions
              // Multiple webhooks with same deposit_id but different activity.id might arrive simultaneously
              if (activity.deposit_id) {
                const { data: doubleCheck } = await supabase
                  .from('bridge_transactions')
                  .select('*')
                  .eq('deposit_id', activity.deposit_id)
                  .eq('user_id', virtualAccount.user_id)
                  .eq('transaction_type', 'receive')
                  .maybeSingle()
                
                if (doubleCheck) {
                  // Transaction was created by another webhook with same deposit_id
                  // Update it instead of creating a new one
                  console.log(`[BRIDGE-WEBHOOK] Found existing transaction by deposit_id (double-check) ${activity.deposit_id}: ${doubleCheck.transaction_id}`)
                  const statusChanged = doubleCheck.status !== activityStatus
                  const statusIsForward = isStatusForward(doubleCheck.status, activityStatus)
                  const hasNewReceiptInfo = activity.receipt?.final_amount || activity.receipt?.destination_tx_hash
                  
                  if ((statusChanged && statusIsForward) || hasNewReceiptInfo) {
                    const statusToUpdate = statusIsForward ? activityStatus : doubleCheck.status
                    await bridgeTransactionService.updateTransactionStatus(
                      doubleCheck.transaction_id, // Use transaction_id (internal ID) to update the same row
                      statusToUpdate,
                      {
                        receiptFinalAmount: activity.receipt?.final_amount ? parseFloat(activity.receipt.final_amount) : undefined,
                        receiptDestinationTxHash: activity.receipt?.destination_tx_hash,
                        completedAt: activityStatus === 'payment_processed' ? new Date().toISOString() : undefined,
                        metadata: eventObject,
                        activityId: activityId, // Update activity_id and bridge_transaction_id to latest activity.id
                      }
                    )
                    console.log(`[BRIDGE-WEBHOOK] ✅ Updated deposit transaction: ${doubleCheck.transaction_id}`)
                  }
                  transactionCreated = true
                  // Skip creation - transaction already exists
                }
              }
              
              // Only create if we didn't find an existing transaction in double-check
              if (!transactionCreated) {
                const createStartTime = Date.now()
              console.log(`[BRIDGE-WEBHOOK] 📝 Creating deposit transaction in database at ${new Date().toISOString()}...`)
              
                // Use activity.id as bridge_transaction_id (will be updated to latest activity.id when status changes)
                const bridgeTransactionId = activityId
              
              const createdTx = await bridgeTransactionService.createDepositTransaction({
                userId: virtualAccount.user_id,
                bridgeActivityId: bridgeTransactionId,
                virtualAccountId: virtualAccountId,
                amount: parseFloat(activity.amount),
                currency: activityCurrency, // Normalized currency (usdc -> USD)
                status: activityStatus, // Current status (could be funds_scheduled, funds_received, etc.)
                depositId: activity.deposit_id,
                recipientName: activity.source?.sender_name,
                sourcePaymentRail: activity.source?.payment_rail,
                receiptFinalAmount: activity.receipt?.final_amount ? parseFloat(activity.receipt.final_amount) : undefined,
                receiptDestinationTxHash: activity.receipt?.destination_tx_hash,
                reference: activity.reference || activity.memo,
                metadata: eventObject,
                bridgeCreatedAt: activity.created_at,
              })
              
                const createDuration = Date.now() - createStartTime
                console.log(`[BRIDGE-WEBHOOK] ✅ Created deposit transaction ${createdTx.transaction_id} (${activityStatus}) in ${createDuration}ms at ${new Date().toISOString()}`)
                transactionCreated = true
              }
            }
          } catch (txError: any) {
            // Log full error details for debugging
            console.error(`[BRIDGE-WEBHOOK] ❌ CRITICAL: Failed to create/update deposit transaction:`, {
              error: txError.message,
              stack: txError.stack,
              activityId,
              virtualAccountId,
              userId: virtualAccount.user_id,
              amount: activity.amount,
              currency: activity.currency,
              eventType,
            })
            
            // Only trigger sync as last resort if transaction creation completely failed
            // Don't trigger sync for duplicate key errors (transaction already exists)
            if (!txError?.code || txError.code !== '23505') {
              console.log(`[BRIDGE-WEBHOOK] 🔄 Triggering background sync as fallback for user ${virtualAccount.user_id}...`)
              const { syncAllTransactions } = await import("@/lib/bridge-transaction-sync")
              // Run sync in background, don't await (non-blocking)
              syncAllTransactions(virtualAccount.user_id).catch((syncError: any) => {
                console.error(`[BRIDGE-WEBHOOK] ❌ Background sync also failed:`, syncError.message)
              })
            } else {
              console.log(`[BRIDGE-WEBHOOK] ⏭️ Duplicate key error - transaction already exists, skipping sync fallback`)
            }
          }

          // Store processed event
          await storeProcessedEvent(eventId, eventType, eventObject, virtualAccount.user_id)
        } else {
          console.warn(`[BRIDGE-WEBHOOK] Virtual account not found: ${virtualAccountId}`)
        }
        break
      }

      case "transfer.created": {
        // New transfer created (send transaction)
        console.log(`[BRIDGE-WEBHOOK] 🚀 Processing transfer.created event at ${new Date().toISOString()}`)
        const transfer = eventObject
        const transferId = transfer.id
        const customerId = transfer.on_behalf_of || transfer.customer_id

        console.log(`[BRIDGE-WEBHOOK] Transfer details:`, {
          transferId,
          customerId,
          amount: transfer.amount,
          currency: transfer.currency,
          state: transfer.state,
          status: transfer.status,
          created_at: transfer.created_at,
        })

        // Find user by Bridge customer ID
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()

        if (userError) {
          console.error(`[BRIDGE-WEBHOOK] ❌ Error finding user:`, userError)
        }

        if (user) {
          console.log(`[BRIDGE-WEBHOOK] ✅ User found: ${user.id}, creating transaction NOW at ${new Date().toISOString()}`)

          let transactionCreated = false
          try {
            // Create send transaction
            const { bridgeTransactionService } = await import("@/lib/bridge-transaction-service")
            
            // Check if transaction already exists
            const existing = await bridgeTransactionService.getTransactionByBridgeId(transferId)
            
            if (!existing) {
              await bridgeTransactionService.createSendTransaction({
                userId: user.id,
                bridgeTransferId: transferId,
                amount: parseFloat(transfer.amount),
                currency: transfer.currency,
                status: transfer.state || transfer.status || 'awaiting_funds',
                sourceWalletId: transfer.source?.bridge_wallet_id || '',
                sourcePaymentRail: transfer.source?.payment_rail || 'bridge_wallet',
                destinationPaymentRail: transfer.destination?.payment_rail || '',
                destinationExternalAccountId: transfer.destination?.external_account_id,
                destinationWalletId: transfer.destination?.bridge_wallet_id,
                destinationCryptoAddress: transfer.destination?.to_address,
                receiptFinalAmount: transfer.receipt?.final_amount ? parseFloat(transfer.receipt.final_amount) : undefined,
                receiptTraceNumber: transfer.receipt?.trace_number,
                receiptImad: transfer.receipt?.imad,
                receiptDestinationTxHash: transfer.receipt?.destination_tx_hash,
                metadata: eventObject,
                bridgeCreatedAt: transfer.created_at,
              })
              console.log(`[BRIDGE-WEBHOOK] ✅ Created send transaction for transfer: ${transferId}`)
              transactionCreated = true
            } else {
              console.log(`[BRIDGE-WEBHOOK] ⚠️ Send transaction already exists for transfer: ${transferId}`)
              transactionCreated = true
            }
          } catch (txError: any) {
            // Log full error details for debugging
            console.error(`[BRIDGE-WEBHOOK] ❌ CRITICAL: Failed to create send transaction:`, {
              error: txError.message,
              stack: txError.stack,
              transferId,
              customerId,
              userId: user.id,
              amount: transfer.amount,
              currency: transfer.currency,
              eventType,
            })
            
            // Trigger background sync as fallback to ensure transaction is eventually created
            console.log(`[BRIDGE-WEBHOOK] 🔄 Triggering background sync as fallback for user ${user.id}...`)
            const { syncAllTransactions } = await import("@/lib/bridge-transaction-sync")
            syncAllTransactions(user.id).catch((syncError: any) => {
              console.error(`[BRIDGE-WEBHOOK] ❌ Background sync also failed:`, syncError.message)
            })
          }

          // Store processed event
          await storeProcessedEvent(eventId, eventType, eventObject, user.id)
        } else {
          console.warn(`[BRIDGE-WEBHOOK] User not found for customer: ${customerId}`)
          await storeProcessedEvent(eventId, eventType, eventObject, undefined)
        }
        break
      }

      case "transfer.updated":
      case "transfer.updated.status_transitioned": {
        // Transfer status changed (send transaction update)
        const transfer = eventObject
        const transferId = transfer.id
        const newStatus = transfer.state || transfer.status

        console.log(`[BRIDGE-WEBHOOK] Transfer updated: ${transferId}, Status: ${newStatus}`)

        try {
          // Update transaction status
          const { bridgeTransactionService } = await import("@/lib/bridge-transaction-service")
          
          const existing = await bridgeTransactionService.getTransactionByBridgeId(transferId)
          
          if (existing) {
            await bridgeTransactionService.updateTransactionStatus(
              transferId,
              newStatus,
              {
                receiptFinalAmount: transfer.receipt?.final_amount ? parseFloat(transfer.receipt.final_amount) : undefined,
                receiptTraceNumber: transfer.receipt?.trace_number,
                receiptImad: transfer.receipt?.imad,
                receiptDestinationTxHash: transfer.receipt?.destination_tx_hash,
                completedAt: (newStatus === 'payment_processed' || newStatus === 'completed') ? new Date().toISOString() : undefined,
                metadata: eventObject,
              },
            )
            console.log(`[BRIDGE-WEBHOOK] ✅ Updated send transaction: ${existing.transaction_id}`)
          } else {
            // Transaction doesn't exist yet - might be created from API call, try to create it now
            const customerId = transfer.on_behalf_of || transfer.customer_id
            const { data: user } = await supabase
              .from("users")
              .select("id")
              .eq("bridge_customer_id", customerId)
              .single()

            if (user) {
              await bridgeTransactionService.createSendTransaction({
                userId: user.id,
                bridgeTransferId: transferId,
                amount: parseFloat(transfer.amount),
                currency: transfer.currency,
                status: newStatus,
                sourceWalletId: transfer.source?.bridge_wallet_id || '',
                sourcePaymentRail: transfer.source?.payment_rail || 'bridge_wallet',
                destinationPaymentRail: transfer.destination?.payment_rail || '',
                destinationExternalAccountId: transfer.destination?.external_account_id,
                destinationWalletId: transfer.destination?.bridge_wallet_id,
                destinationCryptoAddress: transfer.destination?.to_address,
                receiptFinalAmount: transfer.receipt?.final_amount ? parseFloat(transfer.receipt.final_amount) : undefined,
                receiptTraceNumber: transfer.receipt?.trace_number,
                receiptImad: transfer.receipt?.imad,
                receiptDestinationTxHash: transfer.receipt?.destination_tx_hash,
                metadata: eventObject,
                bridgeCreatedAt: transfer.created_at,
              })
              console.log(`[BRIDGE-WEBHOOK] ✅ Created send transaction from update event: ${transferId}`)
            } else {
              console.warn(`[BRIDGE-WEBHOOK] ⚠️ User not found for customer ${customerId} when trying to create transaction from update event`)
            }
          }
        } catch (txError: any) {
          // Log full error details for debugging
          console.error(`[BRIDGE-WEBHOOK] ❌ CRITICAL: Failed to update/create send transaction:`, {
            error: txError.message,
            stack: txError.stack,
            transferId,
            newStatus,
            eventType,
          })
          
          // Trigger background sync as fallback
          const customerId = transfer.on_behalf_of || transfer.customer_id
          const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("bridge_customer_id", customerId)
            .single()
          
          if (user) {
            console.log(`[BRIDGE-WEBHOOK] 🔄 Triggering background sync as fallback for user ${user.id}...`)
            const { syncAllTransactions } = await import("@/lib/bridge-transaction-sync")
            syncAllTransactions(user.id).catch((syncError: any) => {
              console.error(`[BRIDGE-WEBHOOK] ❌ Background sync also failed:`, syncError.message)
            })
          }
        }

        // Store processed event
        const customerId = transfer.on_behalf_of || transfer.customer_id
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("bridge_customer_id", customerId)
          .single()
        await storeProcessedEvent(eventId, eventType, eventObject, user?.id)
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
        console.warn(`[WEBHOOK] ⚠️ Unhandled Bridge webhook event type: ${eventType}`)
        console.warn(`[WEBHOOK] Event object:`, JSON.stringify(eventObject, null, 2).substring(0, 1000))
        // Store unhandled events for debugging
        await storeProcessedEvent(eventId, eventType, eventObject, undefined)
    }

  } catch (error: any) {
    const processDuration = Date.now() - processStartTime
    console.error(`[WEBHOOK-PROCESS] ❌ Error processing Bridge webhook event after ${processDuration}ms:`, error, error.stack)
    // Don't throw - errors are logged but don't affect webhook response
  } finally {
    const processDuration = Date.now() - processStartTime
    console.log(`[WEBHOOK-PROCESS] ✅ Finished processing ${eventType} in ${processDuration}ms at ${new Date().toISOString()}`)
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

    const processingStartTime = new Date().toISOString()
    console.log("[WEBHOOK] 🎯 Processing event at", processingStartTime, ":", {
      eventType,
      eventCategory,
      eventId,
      hasEventObject: !!eventObject,
      hasChanges: !!eventObjectChanges,
      eventObjectPreview: eventObject ? JSON.stringify(eventObject).substring(0, 200) : null,
    })

    // Check idempotency - prevent duplicate processing
    const eventHash = crypto.createHash("sha256").update(JSON.stringify(eventObject)).digest("hex")
    const alreadyProcessed = await isEventProcessed(eventId, eventHash)
    
    if (alreadyProcessed) {
      console.log(`[WEBHOOK] Event already processed: ${eventType} (${eventId || eventHash})`)
      return NextResponse.json({ received: true, message: "Event already processed" })
    }

    // Process immediately (don't await, but don't delay response)
    // This ensures processing starts right away while we return 200
    const processingPromise = processWebhookEvent(eventType, eventObject, eventId, {
      eventCategory,
      eventObjectChanges,
      eventCreatedAt,
    }).catch((error) => {
      console.error("[WEBHOOK] ❌ Error in async webhook processing:", error, error.stack)
    })

    // Log that we're starting processing
    console.log(`[WEBHOOK] ✅ Webhook received, starting immediate processing for ${eventType} at ${new Date().toISOString()}`)
    
    // Don't await - return immediately but processing happens in background
    // This ensures Bridge gets 200 quickly while we process
    processingPromise.then(() => {
      console.log(`[WEBHOOK] ✅ Finished processing ${eventType} at ${new Date().toISOString()}`)
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


