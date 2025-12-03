// Bridge Onboarding Service
// Orchestrates the complete Bridge account initialization flow

import { bridgeService } from "./bridge-service"
import { supabase } from "./supabase"

interface InitializeBridgeAccountParams {
  userId: string
  email: string
  customerPayload: any
  needsUSD?: boolean
  needsEUR?: boolean
}

interface InitializeBridgeAccountResult {
  customerId: string
  walletId?: string
  usdVirtualAccountId?: string
  eurVirtualAccountId?: string
}

/**
 * Initialize Bridge account for a user
 * This orchestrates: customer creation → wallet creation → virtual account creation
 */
export async function initializeBridgeAccount(
  params: InitializeBridgeAccountParams,
): Promise<InitializeBridgeAccountResult> {
  const { userId, email, customerPayload, needsUSD = true, needsEUR = false } = params

  // Step 1: Create Bridge customer with KYC data
  // IMPORTANT: Check database first to avoid "customer already exists" errors
  // We should always check our database for existing bridge_customer_id before attempting creation
  const { data: existingUser } = await supabase
    .from("users")
    .select("bridge_customer_id")
    .eq("id", userId)
    .single()
  
  let customer: any
  
  if (existingUser?.bridge_customer_id) {
    console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Found existing bridge_customer_id in database: ${existingUser.bridge_customer_id}`)
    console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Verifying customer exists in Bridge...`)
    // Verify the customer actually exists in Bridge before using it
    try {
      customer = await bridgeService.getCustomer(existingUser.bridge_customer_id)
      console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Verified existing customer exists in Bridge: ${customer.id}`)
    } catch (getError: any) {
      // Customer doesn't exist in Bridge - clear the invalid ID and create a new one
      console.warn(`[INITIALIZE-BRIDGE-ACCOUNT] Customer ${existingUser.bridge_customer_id} not found in Bridge. Clearing invalid ID and creating new customer. Error: ${getError.message}`)
      
      // Clear the invalid customer ID from database
      await supabase
        .from("users")
        .update({
          bridge_customer_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
      
      console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Cleared invalid bridge_customer_id from database`)
      customer = null
    }
  }
  
  // Only create customer if we don't have one
  if (!customer) {
    console.log(`[INITIALIZE-BRIDGE-ACCOUNT] No existing customer found, creating new Bridge customer with payload:`, {
      hasEmail: !!customerPayload.email,
      hasFirstName: !!customerPayload.first_name,
      hasLastName: !!customerPayload.last_name,
      hasAddress: !!customerPayload.address,
      hasDateOfBirth: !!customerPayload.date_of_birth,
      hasSignedAgreementId: !!customerPayload.signed_agreement_id,
      hasEndorsements: !!customerPayload.endorsements,
      payloadKeys: Object.keys(customerPayload),
    })
    
    try {
      customer = await bridgeService.createCustomer(userId, customerPayload)
    } catch (error: any) {
      console.error(`[INITIALIZE-BRIDGE-ACCOUNT] Error in createCustomer:`, {
        error: error.message,
        stack: error.stack,
        name: error.name,
        fullErrorDetails: error.fullErrorDetails,
      })
      throw error
    }
    
    console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Bridge customer created:`, {
      hasCustomer: !!customer,
      customerType: typeof customer,
      isArray: Array.isArray(customer),
      customerKeys: customer && typeof customer === 'object' ? Object.keys(customer) : [],
      customerId: customer?.id,
      fullCustomer: customer ? JSON.stringify(customer, null, 2).substring(0, 1000) : 'null',
    })
    
    
    if (!customer) {
      throw new Error("Bridge customer creation returned null or undefined")
    }
    
    if (!customer.id) {
      console.error(`[INITIALIZE-BRIDGE-ACCOUNT] Customer response missing id. Full customer:`, JSON.stringify(customer, null, 2))
      throw new Error(`Bridge customer creation failed: Response missing customer ID. Response: ${JSON.stringify(customer)}`)
    }
    
    // IMPORTANT: Store customer_id immediately after creation to prevent "customer already exists" errors
  await supabase
    .from("users")
    .update({
      bridge_customer_id: customer.id,
      bridge_kyc_status: customer.kyc_status,
      bridge_endorsements: customer.endorsements || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    
    console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Stored new bridge_customer_id in database: ${customer.id}`)
  } else {
    // Customer already exists, just update KYC status if needed
    await supabase
      .from("users")
      .update({
        bridge_kyc_status: customer.kyc_status,
        bridge_endorsements: customer.endorsements || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  }

  const result: InitializeBridgeAccountResult = {
    customerId: customer.id,
  }

  // Step 2: Create wallet (only if KYC is approved or in review)
  // Note: Some operations may require KYC approval first
  try {
    const wallet = await bridgeService.createWallet(customer.id, "solana")
    result.walletId = wallet.id

    // Store wallet in database
    await supabase.from("bridge_wallets").insert({
      user_id: userId,
      bridge_wallet_id: wallet.id,
      chain: "solana",
      address: wallet.address,
      status: wallet.status,
    })

    // Update user with wallet ID
    await supabase
      .from("users")
      .update({
        bridge_wallet_id: wallet.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  } catch (error) {
    console.error("Error creating wallet (may require KYC approval first):", error)
    // Continue - wallet can be created later after KYC approval
  }

  // Step 3: Create virtual accounts
  // Only create if endorsements are approved
  if (needsUSD) {
    try {
      const baseEndorsement = await bridgeService.checkEndorsementStatus(customer.id, "base")
      
      if (baseEndorsement?.status === "approved") {
        console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Creating USD virtual account (endorsement status: ${baseEndorsement.status})`)
        const usdAccount = await bridgeService.createVirtualAccount(
          customer.id,
          "usd",
          result.walletId,
        )
        result.usdVirtualAccountId = usdAccount.id

        // Store virtual account in database
        await supabase.from("bridge_virtual_accounts").insert({
          user_id: userId,
          bridge_virtual_account_id: usdAccount.id,
          currency: "usd",
          account_number: usdAccount.source_deposit_instructions?.bank_account_number,
          routing_number: usdAccount.source_deposit_instructions?.bank_routing_number,
          bank_name: usdAccount.source_deposit_instructions?.bank_name,
          status: usdAccount.status,
        })

        // Update user with virtual account ID
        await supabase
          .from("users")
          .update({
            bridge_usd_virtual_account_id: usdAccount.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
        
        console.log(`[INITIALIZE-BRIDGE-ACCOUNT] USD virtual account created: ${usdAccount.id}`)
      } else {
        console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Base endorsement not approved yet (status: ${baseEndorsement?.status || 'unknown'}), skipping USD virtual account creation`)
      }
    } catch (error: any) {
      console.error(`[INITIALIZE-BRIDGE-ACCOUNT] Error creating USD virtual account:`, error.message || error)
      // Continue - can be created later after endorsement approval
    }
  }

  if (needsEUR) {
    try {
      const sepaEndorsement = await bridgeService.checkEndorsementStatus(customer.id, "sepa")
      
      if (sepaEndorsement?.status === "approved") {
        console.log(`[INITIALIZE-BRIDGE-ACCOUNT] Creating EUR virtual account (endorsement status: ${sepaEndorsement.status})`)
        const eurAccount = await bridgeService.createVirtualAccount(
          customer.id,
          "eur",
          result.walletId,
        )
        result.eurVirtualAccountId = eurAccount.id

        // Store virtual account in database
        await supabase.from("bridge_virtual_accounts").insert({
          user_id: userId,
          bridge_virtual_account_id: eurAccount.id,
          currency: "eur",
          iban: eurAccount.source_deposit_instructions?.iban,
          bic: eurAccount.source_deposit_instructions?.bic,
          bank_name: eurAccount.source_deposit_instructions?.bank_name,
          status: eurAccount.status,
        })

        // Update user with virtual account ID
        await supabase
          .from("users")
          .update({
            bridge_eur_virtual_account_id: eurAccount.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
        
        console.log(`[INITIALIZE-BRIDGE-ACCOUNT] EUR virtual account created: ${eurAccount.id}`)
      } else {
        console.log(`[INITIALIZE-BRIDGE-ACCOUNT] SEPA endorsement not approved yet (status: ${sepaEndorsement?.status || 'unknown'}), skipping EUR virtual account creation`)
      }
    } catch (error: any) {
      console.error(`[INITIALIZE-BRIDGE-ACCOUNT] Error creating EUR virtual account:`, error.message || error)
      // Continue - can be created later after endorsement approval
    }
  }

  return result
}

/**
 * Complete account setup after KYC approval (called via webhook or polling)
 * Creates wallet and virtual accounts if they weren't created during initial onboarding
 */
export async function completeAccountSetupAfterKYC(userId: string): Promise<void> {
  console.log(`[completeAccountSetupAfterKYC] Starting for user ${userId}`)
  
  const { data: user } = await supabase
    .from("users")
    .select("bridge_customer_id, bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id")
    .eq("id", userId)
    .single()

  if (!user?.bridge_customer_id) {
    throw new Error("User does not have a Bridge customer ID")
  }

  console.log(`[completeAccountSetupAfterKYC] User has customer ID: ${user.bridge_customer_id}`)
  console.log(`[completeAccountSetupAfterKYC] Current wallet: ${user.bridge_wallet_id || 'none'}`)
  console.log(`[completeAccountSetupAfterKYC] Current USD VA: ${user.bridge_usd_virtual_account_id || 'none'}`)
  console.log(`[completeAccountSetupAfterKYC] Current EUR VA: ${user.bridge_eur_virtual_account_id || 'none'}`)

  const customer = await bridgeService.getCustomer(user.bridge_customer_id)
  console.log(`[completeAccountSetupAfterKYC] Customer endorsements:`, customer.endorsements)

  // Create wallet if it doesn't exist
  if (!user.bridge_wallet_id) {
    try {
      console.log(`[completeAccountSetupAfterKYC] Creating wallet for customer ${user.bridge_customer_id}...`)
      const wallet = await bridgeService.createWallet(user.bridge_customer_id, "solana")
      console.log(`[completeAccountSetupAfterKYC] Wallet created: ${wallet.id}, address: ${wallet.address}`)
      
      await supabase.from("bridge_wallets").insert({
        user_id: userId,
        bridge_wallet_id: wallet.id,
        chain: "solana",
        address: wallet.address,
        status: wallet.status,
      })

      await supabase
        .from("users")
        .update({
          bridge_wallet_id: wallet.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
      console.log(`[completeAccountSetupAfterKYC] Wallet saved to database`)
    } catch (error: any) {
      console.error("Error creating wallet:", error)
      console.error("Wallet creation error details:", error.message, error.stack)
      throw error // Re-throw to see the error in test endpoint
    }
  } else {
    console.log(`[completeAccountSetupAfterKYC] Wallet already exists: ${user.bridge_wallet_id}`)
  }

  // Check endorsements and create virtual accounts if approved
  const baseEndorsement = customer.endorsements?.find((e) => e.name === "base")
  const sepaEndorsement = customer.endorsements?.find((e) => e.name === "sepa")

  console.log(`[completeAccountSetupAfterKYC] Base endorsement status: ${baseEndorsement?.status || 'not found'}`)
  console.log(`[completeAccountSetupAfterKYC] SEPA endorsement status: ${sepaEndorsement?.status || 'not found'}`)

  // Create USD virtual account if base endorsement is approved
  if (baseEndorsement?.status === "approved" && !user.bridge_usd_virtual_account_id) {
    try {
      console.log(`[completeAccountSetupAfterKYC] Creating USD virtual account...`)
      const usdAccount = await bridgeService.createVirtualAccount(
        user.bridge_customer_id,
        "usd",
        user.bridge_wallet_id || undefined,
      )
      console.log(`[completeAccountSetupAfterKYC] USD virtual account created: ${usdAccount.id}`)

      await supabase.from("bridge_virtual_accounts").insert({
        user_id: userId,
        bridge_virtual_account_id: usdAccount.id,
        currency: "usd",
        account_number: usdAccount.source_deposit_instructions?.bank_account_number,
        routing_number: usdAccount.source_deposit_instructions?.bank_routing_number,
        bank_name: usdAccount.source_deposit_instructions?.bank_name,
        status: usdAccount.status,
      })

      await supabase
        .from("users")
        .update({
          bridge_usd_virtual_account_id: usdAccount.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
      console.log(`[completeAccountSetupAfterKYC] USD virtual account saved to database`)
    } catch (error: any) {
      console.error("Error creating USD virtual account:", error)
      console.error("USD VA creation error details:", error.message, error.stack)
      // Don't throw - continue with EUR account creation
    }
  } else {
    if (!baseEndorsement || baseEndorsement.status !== "approved") {
      console.log(`[completeAccountSetupAfterKYC] Base endorsement not approved (status: ${baseEndorsement?.status || 'not found'}), skipping USD virtual account`)
    } else if (user.bridge_usd_virtual_account_id) {
      console.log(`[completeAccountSetupAfterKYC] USD virtual account already exists: ${user.bridge_usd_virtual_account_id}`)
    }
  }

  // Create EUR virtual account if sepa endorsement is approved
  if (sepaEndorsement?.status === "approved" && !user.bridge_eur_virtual_account_id) {
    try {
      console.log(`[completeAccountSetupAfterKYC] Creating EUR virtual account...`)
      const eurAccount = await bridgeService.createVirtualAccount(
        user.bridge_customer_id,
        "eur",
        user.bridge_wallet_id || undefined,
      )
      console.log(`[completeAccountSetupAfterKYC] EUR virtual account created: ${eurAccount.id}`)

      await supabase.from("bridge_virtual_accounts").insert({
        user_id: userId,
        bridge_virtual_account_id: eurAccount.id,
        currency: "eur",
        iban: eurAccount.source_deposit_instructions?.iban,
        bic: eurAccount.source_deposit_instructions?.bic,
        bank_name: eurAccount.source_deposit_instructions?.bank_name,
        status: eurAccount.status,
      })

      await supabase
        .from("users")
        .update({
          bridge_eur_virtual_account_id: eurAccount.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
      console.log(`[completeAccountSetupAfterKYC] EUR virtual account saved to database`)
    } catch (error: any) {
      console.error("Error creating EUR virtual account:", error)
      console.error("EUR VA creation error details:", error.message, error.stack)
      // Don't throw - wallet and USD account may have been created successfully
    }
  } else {
    if (!sepaEndorsement || sepaEndorsement.status !== "approved") {
      console.log(`[completeAccountSetupAfterKYC] SEPA endorsement not approved (status: ${sepaEndorsement?.status || 'not found'}), skipping EUR virtual account`)
    } else if (user.bridge_eur_virtual_account_id) {
      console.log(`[completeAccountSetupAfterKYC] EUR virtual account already exists: ${user.bridge_eur_virtual_account_id}`)
    }
  }
  
  console.log(`[completeAccountSetupAfterKYC] Completed for user ${userId}`)
}

