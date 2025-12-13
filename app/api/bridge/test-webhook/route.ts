// Test endpoint for manually triggering Bridge webhook flow
// This allows testing the webhook implementation without waiting for actual Bridge webhooks
// Usage: POST /api/bridge/test-webhook with { userId: string, customerId?: string, kycStatus?: string }

import { type NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import { completeAccountSetupAfterKYC } from "@/lib/bridge-onboarding-service"

/**
 * POST /api/bridge/test-webhook
 * Manually trigger the webhook flow for testing
 * Body: { 
 *   userId?: string, 
 *   customerId?: string, 
 *   kycStatus?: 'approved' | 'pending' | 'rejected',
 *   forceCreateAccounts?: boolean  // Force create wallet/accounts even if endorsements not approved
 * }
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  
  const targetUserId = body.userId || user.id
  const customerId = body.customerId
  const kycStatus = body.kycStatus || 'approved'
  const forceCreateAccounts = body.forceCreateAccounts || false

  try {
    // Get user's Bridge customer ID if not provided
    let bridgeCustomerId = customerId
    if (!bridgeCustomerId) {
      const { data: userProfile } = await supabase
        .from("users")
        .select("bridge_customer_id")
        .eq("id", targetUserId)
        .single()

      if (!userProfile?.bridge_customer_id) {
        return createErrorResponse(
          "User does not have a Bridge customer ID. Please create a Bridge customer first.",
          400
        )
      }
      bridgeCustomerId = userProfile.bridge_customer_id
    }

    // Simulate webhook event: customer.updated.status_transitioned
    console.log(`[TEST] Simulating webhook for user ${targetUserId}, customer ${bridgeCustomerId}, status ${kycStatus}`)

    // Update KYC status in database
    await supabase
      .from("users")
      .update({
        bridge_kyc_status: kycStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId)

    // If KYC is approved, trigger account setup (wallet + virtual accounts)
    if (kycStatus === "approved") {
      try {
        console.log(`[TEST] Starting account setup for user ${targetUserId}...`)
        await completeAccountSetupAfterKYC(targetUserId)
        console.log(`[TEST] Account setup completed for user ${targetUserId}`)
        
        // If forceCreateAccounts is true, create virtual accounts even if endorsements aren't approved
        if (forceCreateAccounts) {
          console.log(`[TEST] Force creating virtual accounts (ignoring endorsement status)...`)
          const { data: userProfile } = await supabase
            .from("users")
            .select("bridge_customer_id, bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id")
            .eq("id", targetUserId)
            .single()
          
          if (userProfile?.bridge_customer_id) {
            // Force create USD account if it doesn't exist
            if (!userProfile.bridge_usd_virtual_account_id && userProfile.bridge_wallet_id) {
              try {
                const { bridgeService } = await import("@/lib/bridge-service")
                const usdAccount = await bridgeService.createVirtualAccount(
                  userProfile.bridge_customer_id,
                  "usd",
                  userProfile.bridge_wallet_id
                )
                await supabase.from("bridge_virtual_accounts").insert({
                  user_id: targetUserId,
                  bridge_virtual_account_id: usdAccount.id,
                  currency: "usd",
                  account_number: usdAccount.source_deposit_instructions?.bank_account_number,
                  routing_number: usdAccount.source_deposit_instructions?.bank_routing_number,
                  bank_name: usdAccount.source_deposit_instructions?.bank_name,
                  bank_address: usdAccount.source_deposit_instructions?.bank_address,
                  account_holder_name: usdAccount.source_deposit_instructions?.bank_beneficiary_name || usdAccount.source_deposit_instructions?.account_holder_name,
                  status: usdAccount.status,
                })
                await supabase
                  .from("users")
                  .update({ bridge_usd_virtual_account_id: usdAccount.id })
                  .eq("id", targetUserId)
                console.log(`[TEST] Force created USD virtual account: ${usdAccount.id}`)
              } catch (error: any) {
                console.error(`[TEST] Error force creating USD account:`, error.message)
              }
            }
            
            // Force create EUR account if it doesn't exist
            if (!userProfile.bridge_eur_virtual_account_id && userProfile.bridge_wallet_id) {
              try {
                const { bridgeService } = await import("@/lib/bridge-service")
                const eurAccount = await bridgeService.createVirtualAccount(
                  userProfile.bridge_customer_id,
                  "eur",
                  userProfile.bridge_wallet_id
                )
                await supabase.from("bridge_virtual_accounts").insert({
                  user_id: targetUserId,
                  bridge_virtual_account_id: eurAccount.id,
                  currency: "eur",
                  iban: eurAccount.source_deposit_instructions?.iban,
                  bic: eurAccount.source_deposit_instructions?.bic,
                  bank_name: eurAccount.source_deposit_instructions?.bank_name,
                  status: eurAccount.status,
                })
                await supabase
                  .from("users")
                  .update({ bridge_eur_virtual_account_id: eurAccount.id })
                  .eq("id", targetUserId)
                console.log(`[TEST] Force created EUR virtual account: ${eurAccount.id}`)
              } catch (error: any) {
                console.error(`[TEST] Error force creating EUR account:`, error.message)
              }
            }
          }
        }
      } catch (error: any) {
        console.error(`[TEST] Error completing account setup:`, error)
        console.error(`[TEST] Error stack:`, error.stack)
        return NextResponse.json({
          success: false,
          message: "KYC status updated, but account setup failed",
          error: error.message,
          stack: error.stack,
          userId: targetUserId,
          customerId: bridgeCustomerId,
          kycStatus,
        }, { status: 500 })
      }
    }

    // Get updated user data
    const { data: updatedUser } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_kyc_status, bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id")
      .eq("id", targetUserId)
      .single()

    return NextResponse.json({
      success: true,
      message: `Webhook flow completed for user ${targetUserId}`,
      userId: targetUserId,
      customerId: bridgeCustomerId,
      kycStatus,
      accountDetails: {
        walletId: updatedUser?.bridge_wallet_id || null,
        usdVirtualAccountId: updatedUser?.bridge_usd_virtual_account_id || null,
        eurVirtualAccountId: updatedUser?.bridge_eur_virtual_account_id || null,
      },
    })
  } catch (error: any) {
    console.error("Error in test webhook:", error)
    return createErrorResponse(
      `Test webhook failed: ${error.message || "Unknown error"}`,
      500
    )
  }
})

