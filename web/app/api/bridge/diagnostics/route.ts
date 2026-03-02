// Diagnostic endpoint to check Bridge API connectivity and customer status
// Usage: GET /api/bridge/diagnostics

import { type NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    userId: user.id,
    checks: {},
    errors: [],
  }

  // Check 1: Environment variables
  diagnostics.checks.env = {
    hasApiKey: !!process.env.BRIDGE_API_KEY,
    apiKeyPrefix: process.env.BRIDGE_API_KEY?.substring(0, 10) + '...' || 'NOT SET',
    baseUrl: process.env.BRIDGE_API_BASE_URL || 'https://api.bridge.xyz',
  }

  // Check 2: User profile in database
  try {
    const { data: userProfile, error } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id, bridge_signed_agreement_id, bridge_kyc_status, email")
      .eq("id", user.id)
      .single()

    if (error) throw error

    diagnostics.checks.database = {
      hasCustomerId: !!userProfile?.bridge_customer_id,
      customerId: userProfile?.bridge_customer_id || null,
      hasWalletId: !!userProfile?.bridge_wallet_id,
      walletId: userProfile?.bridge_wallet_id || null,
      hasUsdAccount: !!userProfile?.bridge_usd_virtual_account_id,
      usdAccountId: userProfile?.bridge_usd_virtual_account_id || null,
      hasEurAccount: !!userProfile?.bridge_eur_virtual_account_id,
      eurAccountId: userProfile?.bridge_eur_virtual_account_id || null,
      hasSignedAgreement: !!userProfile?.bridge_signed_agreement_id,
      kycStatus: userProfile?.bridge_kyc_status || null,
      email: userProfile?.email || null,
    }
  } catch (error: any) {
    diagnostics.errors.push(`Database check failed: ${error.message}`)
  }

  // Check 3: KYC submissions
  try {
    const { kycService } = await import("@/lib/kyc-service")
    const submissions = await kycService.getByUserId(user.id)
    const identitySubmission = submissions.find(s => s.type === "identity")
    const addressSubmission = submissions.find(s => s.type === "address")

    diagnostics.checks.kyc = {
      hasIdentitySubmission: !!identitySubmission,
      identityStatus: identitySubmission?.status || null,
      hasAddressSubmission: !!addressSubmission,
      addressStatus: addressSubmission?.status || null,
      bothApproved: identitySubmission?.status === "approved" && addressSubmission?.status === "approved",
    }
  } catch (error: any) {
    diagnostics.errors.push(`KYC check failed: ${error.message}`)
  }

  // Check 4: Bridge API connectivity (if customer exists)
  const userProfile = diagnostics.checks.database
  if (userProfile?.customerId) {
    try {
      const customer = await bridgeService.getCustomer(userProfile.customerId)
      diagnostics.checks.bridgeApi = {
        connected: true,
        customerId: customer.id,
        kycStatus: customer.kyc_status,
        endorsements: customer.endorsements || [],
        hasRejectionReasons: !!(customer.rejection_reasons && customer.rejection_reasons.length > 0),
        rejectionReasons: customer.rejection_reasons || [],
      }

      // Check wallet if exists
      if (userProfile.walletId && userProfile.customerId) {
        try {
          const walletBalance = await bridgeService.getWalletBalance(userProfile.customerId, userProfile.walletId)
          diagnostics.checks.wallet = {
            exists: true,
            walletId: userProfile.walletId,
            balances: walletBalance,
          }
        } catch (error: any) {
          diagnostics.checks.wallet = {
            exists: true,
            walletId: userProfile.walletId,
            error: error.message,
          }
        }
      }

      // Check virtual accounts if they exist
      if (userProfile.usdAccountId) {
        try {
          const usdAccount = await bridgeService.getVirtualAccountDetails(userProfile.usdAccountId)
          diagnostics.checks.usdAccount = {
            exists: true,
            accountId: userProfile.usdAccountId,
            status: usdAccount.status,
            hasAccountNumber: !!usdAccount.source_deposit_instructions?.bank_account_number,
          }
        } catch (error: any) {
          diagnostics.checks.usdAccount = {
            exists: true,
            accountId: userProfile.usdAccountId,
            error: error.message,
          }
        }
      }

      if (userProfile.eurAccountId) {
        try {
          const eurAccount = await bridgeService.getVirtualAccountDetails(userProfile.eurAccountId)
          diagnostics.checks.eurAccount = {
            exists: true,
            accountId: userProfile.eurAccountId,
            status: eurAccount.status,
            hasIban: !!eurAccount.source_deposit_instructions?.iban,
          }
        } catch (error: any) {
          diagnostics.checks.eurAccount = {
            exists: true,
            accountId: userProfile.eurAccountId,
            error: error.message,
          }
        }
      }
    } catch (error: any) {
      diagnostics.checks.bridgeApi = {
        connected: false,
        error: error.message,
        stack: error.stack,
      }
      diagnostics.errors.push(`Bridge API check failed: ${error.message}`)
    }
  } else {
    diagnostics.checks.bridgeApi = {
      connected: false,
      reason: "No Bridge customer ID in database",
    }
  }

  // Check 5: Test API key with a simple endpoint (list customers - should work even with no customers)
  try {
    // Try to list customers - this is a simple endpoint that should work if API key is valid
    const testResponse = await fetch(`${process.env.BRIDGE_API_BASE_URL || 'https://api.bridge.xyz'}/v0/customers?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.BRIDGE_API_KEY || '',
      },
    })
    
    diagnostics.checks.apiKeyTest = {
      status: testResponse.status,
      statusText: testResponse.statusText,
      isValid: testResponse.status !== 401,
      message: testResponse.status === 401 
        ? 'API key is invalid, expired, or lacks permissions' 
        : testResponse.status === 200 
          ? 'API key is valid' 
          : `Unexpected status: ${testResponse.status}`,
    }
    
    if (testResponse.status === 401) {
      const errorText = await testResponse.text()
      diagnostics.checks.apiKeyTest.errorDetails = errorText.substring(0, 200)
      diagnostics.errors.push('API key authentication failed - key may be invalid, expired, or lack permissions')
    }
  } catch (error: any) {
    diagnostics.checks.apiKeyTest = {
      error: error.message,
    }
    diagnostics.errors.push(`API key test failed: ${error.message}`)
  }

  return NextResponse.json(diagnostics, { status: 200 })
})

