// Simple endpoint to create wallet and virtual accounts for testing
// This bypasses endorsement checks and creates accounts directly
// Usage: POST /api/bridge/create-accounts

import { type NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"
import { buildBridgeCustomerPayloadFromKyc } from "@/lib/bridge-kyc-builder"
import { initializeBridgeAccount } from "@/lib/bridge-onboarding-service"

/**
 * POST /api/bridge/create-accounts
 * Create wallet and virtual accounts for the authenticated user
 * This is a testing endpoint that bypasses endorsement checks
 * If customer doesn't exist, creates it first using KYC data from database
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  
  // Use server client (service role) to bypass RLS
  const supabase = createServerClient()
  
  // Check if request body contains an existing customer ID to link
  let existingCustomerId: string | null = null
  try {
    const body = await request.json().catch(() => ({}))
    existingCustomerId = body.existingCustomerId || null
  } catch {
    // Body might be empty, that's fine
  }
  
  try {
    // Get user's Bridge customer ID and check if customer exists
    // requireUser already fetched the profile, but we need to get the Bridge-specific fields
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("bridge_customer_id, bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id, bridge_signed_agreement_id, email")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error(`[CREATE-ACCOUNTS] Error fetching user profile:`, {
        error: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        userId: user.id,
      })
      return createErrorResponse(`Failed to fetch user profile: ${profileError.message}`, 500)
    }

    if (!userProfile) {
      console.error(`[CREATE-ACCOUNTS] User profile not found in database for user:`, user.id, user.email)
      return createErrorResponse("User profile not found in database. Please contact support.", 404)
    }
    
    console.log(`[CREATE-ACCOUNTS] User profile found:`, {
      userId: user.id,
      email: userProfile.email,
      hasCustomerId: !!userProfile.bridge_customer_id,
      hasWalletId: !!userProfile.bridge_wallet_id,
      hasUsdAccount: !!userProfile.bridge_usd_virtual_account_id,
      hasEurAccount: !!userProfile.bridge_eur_virtual_account_id,
    })

    let bridgeCustomerId = userProfile.bridge_customer_id

    // IMPORTANT: Verify existing customer_id in database actually exists in Bridge
    // If it doesn't exist, clear it and create a new customer
    if (bridgeCustomerId && !existingCustomerId) {
      console.log(`[CREATE-ACCOUNTS] Verifying existing bridge_customer_id: ${bridgeCustomerId}`)
      try {
        const { bridgeService } = await import("@/lib/bridge-service")
        const customer = await bridgeService.getCustomer(bridgeCustomerId)
        
        console.log(`[CREATE-ACCOUNTS] getCustomer returned:`, {
          hasCustomer: !!customer,
          customerType: typeof customer,
          hasId: !!(customer && customer.id),
          customerId: customer?.id,
        })
        
        if (!customer) {
          throw new Error("getCustomer returned null or undefined")
        }
        
        if (!customer.id) {
          throw new Error(`Customer object missing id property. Customer: ${JSON.stringify(customer)}`)
        }
        
        console.log(`[CREATE-ACCOUNTS] Verified existing customer exists in Bridge: ${customer.id}`)
        // Ensure the customer ID is stored (in case it wasn't properly saved before)
        if (customer.id && customer.id !== bridgeCustomerId) {
          console.log(`[CREATE-ACCOUNTS] Customer ID mismatch. Updating database with correct ID: ${customer.id}`)
          await supabase
            .from("users")
            .update({
              bridge_customer_id: customer.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
          bridgeCustomerId = customer.id
          userProfile.bridge_customer_id = customer.id
        }
      } catch (verifyError: any) {
        // Customer doesn't exist in Bridge - clear the invalid ID
        console.error(`[CREATE-ACCOUNTS] Error verifying customer ${bridgeCustomerId}:`, {
          error: verifyError.message,
          stack: verifyError.stack,
          name: verifyError.name,
        })
        console.warn(`[CREATE-ACCOUNTS] Customer ${bridgeCustomerId} not found in Bridge. Clearing invalid ID and will create new customer.`)
        await supabase
          .from("users")
          .update({
            bridge_customer_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
        bridgeCustomerId = null
        userProfile.bridge_customer_id = null
        console.log(`[CREATE-ACCOUNTS] Cleared invalid bridge_customer_id from database`)
      }
    }

    // If an existing customer ID was provided, use it and verify it exists
    if (existingCustomerId) {
      console.log(`[CREATE-ACCOUNTS] Using provided existing customer ID: ${existingCustomerId}`)
      try {
        // Verify the customer exists in Bridge
        const { bridgeService } = await import("@/lib/bridge-service")
        const customer = await bridgeService.getCustomer(existingCustomerId)
        
        // Verify the email matches
        if (customer.email && customer.email.toLowerCase() !== (userProfile.email || user.email || '').toLowerCase()) {
          return createErrorResponse(
            `The provided customer ID belongs to a different email (${customer.email}). Please use the correct customer ID for ${userProfile.email || user.email}.`,
            400
          )
        }
        
        // Update the database with the existing customer ID
        await supabase
          .from("users")
          .update({
            bridge_customer_id: existingCustomerId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
        
        bridgeCustomerId = existingCustomerId
        userProfile.bridge_customer_id = existingCustomerId
        console.log(`[CREATE-ACCOUNTS] Linked existing Bridge customer: ${bridgeCustomerId}`)
      } catch (error: any) {
        console.error(`[CREATE-ACCOUNTS] Error verifying existing customer:`, error)
        return createErrorResponse(
          `Failed to verify existing customer ID: ${error.message || "Unknown error"}. Please check the customer ID is correct.`,
          400
        )
      }
    }
    // If no customer exists, create it first using KYC data from database
    else if (!bridgeCustomerId) {
      console.log(`[CREATE-ACCOUNTS] No Bridge customer found, creating customer from KYC data...`)
      
      // Check if user has signed TOS
      if (!userProfile.bridge_signed_agreement_id) {
        // Bridge requires a valid signed_agreement_id
        // We need to generate a TOS link and have the user accept it
        console.log(`[CREATE-ACCOUNTS] TOS not signed. Generating TOS link...`)
        
        try {
          const { bridgeService } = await import("@/lib/bridge-service")
          const tosLink = await bridgeService.getTOSLink(userProfile.email || user.email || '', 'individual')
          
          if (!tosLink || !tosLink.tos_link) {
            console.error(`[CREATE-ACCOUNTS] TOS link created but missing tos_link field:`, tosLink)
            return createErrorResponse(
              "TOS link was created but is missing the link URL. Please try again or contact support.",
              500
            )
          }
          
          // Store the TOS link ID for polling
          await supabase
            .from("users")
            .update({
              bridge_tos_link_id: tosLink.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
          
          console.log(`[CREATE-ACCOUNTS] TOS link generated: ${tosLink.tos_link}`)
          return createErrorResponse(
            `Please sign the Terms of Service first. TOS link: ${tosLink.tos_link}`,
            400
          )
        } catch (tosError: any) {
          console.error(`[CREATE-ACCOUNTS] Error generating TOS link:`, tosError.message)
          return createErrorResponse(
            `Failed to generate TOS link: ${tosError.message || "Unknown error"}. Please try again.`,
            500
          )
        }
      }
        
        // Get KYC submissions to verify they exist
      // Use server client to bypass RLS
      const { kycService } = await import("@/lib/kyc-service")
      const submissions = await kycService.getByUserId(user.id, supabase)
      console.log(`[CREATE-ACCOUNTS] KYC submissions found:`, {
        count: submissions.length,
        types: submissions.map(s => ({ type: s.type, status: s.status })),
        userId: user.id,
      })
      
      const identitySubmission = submissions.find(s => s.type === "identity")
      const addressSubmission = submissions.find(s => s.type === "address")

      if (!identitySubmission || !addressSubmission) {
        console.error(`[CREATE-ACCOUNTS] Missing KYC submissions:`, {
          hasIdentity: !!identitySubmission,
          hasAddress: !!addressSubmission,
          allSubmissions: submissions.map(s => s.type),
        })
        return createErrorResponse(
          "Please complete both identity and address verification before creating accounts.",
          400
        )
      }

      console.log(`[CREATE-ACCOUNTS] KYC submission status:`, {
        identityStatus: identitySubmission.status,
        addressStatus: addressSubmission.status,
      })

      if (identitySubmission.status !== "approved" || addressSubmission.status !== "approved") {
        return createErrorResponse(
          `Both identity and address verification must be approved before creating accounts. Current status: Identity=${identitySubmission.status}, Address=${addressSubmission.status}`,
          400
        )
      }

        try {
          // Verify we have a valid signed_agreement_id (not a placeholder)
          if (!userProfile.bridge_signed_agreement_id) {
            return createErrorResponse(
              "Terms of Service must be signed before creating accounts. Please sign the TOS in the Account Verification screen.",
              400
            )
          }
          
          // Check if it's a placeholder (should not happen, but safety check)
          // Validate signed_agreement_id format
          if (!userProfile.bridge_signed_agreement_id || userProfile.bridge_signed_agreement_id.length < 10) {
            console.error(`[CREATE-ACCOUNTS] ERROR: Placeholder signed_agreement_id detected: ${userProfile.bridge_signed_agreement_id}`)
            return createErrorResponse(
              "Invalid Terms of Service signature. Please sign the TOS again in the Account Verification screen.",
              400
            )
          }
          
          console.log(`[CREATE-ACCOUNTS] Building customer payload from KYC data...`)
          console.log(`[CREATE-ACCOUNTS] Using stored signed_agreement_id: ${userProfile.bridge_signed_agreement_id}`)
          
          // Build customer payload from KYC submissions
          // Pass server client to bypass RLS
          const customerPayload = await buildBridgeCustomerPayloadFromKyc(
            user.id,
            userProfile.bridge_signed_agreement_id, // Use stored signed_agreement_id from database
            true, // needsUSD
            false, // needsEUR
            supabase // Pass server client to bypass RLS
          )
          console.log(`[CREATE-ACCOUNTS] Customer payload built:`, {
            hasEmail: !!customerPayload.email,
            hasFirstName: !!customerPayload.first_name,
            hasLastName: !!customerPayload.last_name,
            hasAddress: !!customerPayload.address,
            hasDateOfBirth: !!customerPayload.date_of_birth,
            hasSsn: !!customerPayload.ssn,
            hasSignedAgreementId: !!customerPayload.signed_agreement_id,
            signedAgreementId: customerPayload.signed_agreement_id, // Log the actual ID being used
          })

          // Initialize Bridge account (creates customer, wallet, virtual accounts)
          console.log(`[CREATE-ACCOUNTS] Initializing Bridge account...`)
          try {
            const result = await initializeBridgeAccount({
              userId: user.id,
              email: userProfile.email || user.email || '',
              customerPayload,
              needsUSD: true,
              needsEUR: false,
            })

            bridgeCustomerId = result.customerId
            console.log(`[CREATE-ACCOUNTS] Bridge customer created successfully: ${bridgeCustomerId}`, {
              walletId: result.walletId,
              usdAccountId: result.usdVirtualAccountId,
              eurAccountId: result.eurVirtualAccountId,
            })
            
            // IMPORTANT: Store the customer_id in database immediately after creation
            // This prevents "customer already exists" errors on subsequent attempts
            await supabase
              .from("users")
              .update({
                bridge_customer_id: bridgeCustomerId,
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id)
            
            console.log(`[CREATE-ACCOUNTS] Stored bridge_customer_id in database: ${bridgeCustomerId}`)

            // Refresh user profile to get updated IDs
            const { data: updatedProfile } = await supabase
              .from("users")
              .select("bridge_customer_id, bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id")
              .eq("id", user.id)
              .single()
            
            if (updatedProfile) {
              userProfile.bridge_customer_id = updatedProfile.bridge_customer_id
              userProfile.bridge_wallet_id = updatedProfile.bridge_wallet_id
              userProfile.bridge_usd_virtual_account_id = updatedProfile.bridge_usd_virtual_account_id
              userProfile.bridge_eur_virtual_account_id = updatedProfile.bridge_eur_virtual_account_id
            }
          } catch (createError: any) {
            // Check if error is "customer already exists"
            if (createError.message?.includes("already exists") || 
                createError.message?.includes("email already exists") ||
                createError.message?.toLowerCase().includes("duplicate")) {
              console.warn(`[CREATE-ACCOUNTS] Customer creation failed - possible duplicate email: ${userProfile.email}`)
              console.log(`[CREATE-ACCOUNTS] Attempting to find existing customer by email...`)
              
              // Fallback: List customers by email to find existing one
              let existingCustomerId: string | null = null
              
              try {
                // First check database
                const { data: existingUser } = await supabase
                  .from("users")
                  .select("bridge_customer_id")
                  .eq("id", user.id)
                  .single()
                
                if (existingUser?.bridge_customer_id) {
                  console.log(`[CREATE-ACCOUNTS] Found customer ID in database: ${existingUser.bridge_customer_id}`)
                  existingCustomerId = existingUser.bridge_customer_id
                  
                  // Verify it exists in Bridge
                  try {
                    const { bridgeService } = await import("@/lib/bridge-service")
                    const verifiedCustomer = await bridgeService.getCustomer(existingCustomerId)
                    console.log(`[CREATE-ACCOUNTS] Verified customer exists in Bridge: ${verifiedCustomer.id}`)
                  } catch (verifyError: any) {
                    console.warn(`[CREATE-ACCOUNTS] Customer ID from database not found in Bridge, clearing and searching by email...`)
                      await supabase
                        .from("users")
                        .update({
                          bridge_customer_id: null,
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", user.id)
                      existingCustomerId = null
                    }
                  }
                
                // If not in database, search Bridge by email
                if (!existingCustomerId) {
                  const { bridgeService } = await import("@/lib/bridge-service")
                  const existingCustomers = await bridgeService.listCustomersByEmail(userProfile.email || user.email || '')
                  
                  if (existingCustomers && existingCustomers.length > 0) {
                    const foundCustomer = existingCustomers[0]
                    existingCustomerId = foundCustomer.id
                    console.log(`[CREATE-ACCOUNTS] Found existing customer in Bridge by email: ${existingCustomerId}`)
                      
                    // Store customer ID in database
                      await supabase
                        .from("users")
                        .update({
                          bridge_customer_id: existingCustomerId,
                        bridge_kyc_status: foundCustomer.kyc_status || 'pending',
                          bridge_endorsements: foundCustomer.endorsements || [],
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", user.id)
                  }
                }
              } catch (listError: any) {
                console.error(`[CREATE-ACCOUNTS] Error finding existing customer:`, listError.message)
              }
              
              if (existingCustomerId) {
                console.log(`[CREATE-ACCOUNTS] Using existing customer ID: ${existingCustomerId}`)
                bridgeCustomerId = existingCustomerId
                userProfile.bridge_customer_id = existingCustomerId
                
                // Ensure it's stored in database
                    await supabase
                      .from("users")
                      .update({
                        bridge_customer_id: existingCustomerId,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("id", user.id)
                    
                console.log(`[CREATE-ACCOUNTS] Stored customer ID in database. Continuing with account creation...`)
                    // Continue with wallet and virtual account creation below (don't return error)
                  } else {
                // Could not find existing customer - return error
                    return createErrorResponse(
                  `Customer creation failed: ${createError.message}. Could not find existing customer by email.`,
                  400
                  )
              }
            } else {
              // Re-throw other errors
              throw createError
            }
          }
        } catch (error: any) {
          console.error(`[CREATE-ACCOUNTS] Error creating Bridge customer:`, error)
          return createErrorResponse(
            `Failed to create Bridge customer: ${error.message || "Unknown error"}. Please check your KYC data is complete.`,
            500
          )
        }
    }

    const results: any = {
      walletCreated: false,
      usdAccountCreated: false,
      eurAccountCreated: false,
      errors: [],
    }
    
    // Step 1: Create wallet if it doesn't exist
    if (!userProfile.bridge_wallet_id) {
        try {
          console.log(`[CREATE-ACCOUNTS] Creating wallet for customer ${bridgeCustomerId}...`)
          // Add timeout to wallet creation
          const wallet = await Promise.race([
            bridgeService.createWallet(bridgeCustomerId, "solana"),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Wallet creation timed out after 15 seconds')), 15000)
            )
          ]) as any
          console.log(`[CREATE-ACCOUNTS] Wallet created: ${wallet.id}, address: ${wallet.address}`)
          
          await supabase.from("bridge_wallets").insert({
            user_id: user.id,
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
            .eq("id", user.id)
          
          results.walletCreated = true
          results.walletId = wallet.id
          results.walletAddress = wallet.address
          console.log(`[CREATE-ACCOUNTS] Wallet saved to database`)
        } catch (error: any) {
          console.error(`[CREATE-ACCOUNTS] Error creating wallet:`, {
            error: error.message,
            stack: error.stack,
            customerId: bridgeCustomerId,
          })
          results.errors.push(`Wallet creation failed: ${error.message}`)
      }
    } else {
      console.log(`[CREATE-ACCOUNTS] Wallet already exists: ${userProfile.bridge_wallet_id}`)
      results.walletId = userProfile.bridge_wallet_id
      
      // Get wallet address from database
      const { data: wallet } = await supabase
        .from("bridge_wallets")
        .select("address")
        .eq("bridge_wallet_id", userProfile.bridge_wallet_id)
        .single()
      if (wallet) {
        results.walletAddress = wallet.address
      }
    }

    // IMPORTANT: Verify customer exists and has accepted TOS before creating virtual accounts
    let customer: any = null // Declare outside try block so it's accessible later
    if (bridgeCustomerId) {
      try {
        // Check TOS status with retries - Bridge may take a moment to update after acceptance
        let hasAcceptedTOS = false
        let retries = 0
        const maxRetries = 3
        
        while (!hasAcceptedTOS && retries < maxRetries) {
          customer = await bridgeService.getCustomer(bridgeCustomerId)
          console.log(`[CREATE-ACCOUNTS] Verified customer ${bridgeCustomerId} exists in Bridge (attempt ${retries + 1}/${maxRetries})`)
          
          // Check if customer has accepted TOS
          hasAcceptedTOS = (customer as any).has_accepted_terms_of_service === true
          console.log(`[CREATE-ACCOUNTS] Customer TOS status: has_accepted_terms_of_service=${hasAcceptedTOS}`)
          
          if (!hasAcceptedTOS && retries < maxRetries - 1) {
            // Wait a bit before retrying - Bridge may still be processing TOS acceptance
            console.log(`[CREATE-ACCOUNTS] TOS not accepted yet, waiting 3 seconds before retry...`)
            await new Promise(resolve => setTimeout(resolve, 3000))
            retries++
          } else {
            break
          }
        }
        
        if (!hasAcceptedTOS) {
          // Customer exists but hasn't accepted TOS (or Bridge hasn't updated yet)
          // Use the tos_link from the customer object (as per Bridge docs)
          console.log(`[CREATE-ACCOUNTS] Customer exists but hasn't accepted TOS after ${maxRetries} checks.`)
          
          const customerTosLink = (customer as any).tos_link
          if (customerTosLink) {
            console.log(`[CREATE-ACCOUNTS] Customer has TOS link: ${customerTosLink}`)
            return createErrorResponse(
              `Terms of Service must be accepted before creating accounts. If you just accepted TOS, please wait a moment and try again. Otherwise, please sign the TOS: ${customerTosLink}`,
              400
            )
          }
          
          // If no tos_link in customer object, try to generate one
          console.log(`[CREATE-ACCOUNTS] Customer has no TOS link, generating new one...`)
          try {
            const tosLink = await bridgeService.getTOSLink(userProfile.email || user.email || '', 'individual')
            
            if (!tosLink || !tosLink.tos_link) {
              console.error(`[CREATE-ACCOUNTS] TOS link created but missing tos_link field:`, tosLink)
              return createErrorResponse(
                "TOS link was created but is missing the link URL. Please try again or contact support.",
                500
              )
            }
            
            console.log(`[CREATE-ACCOUNTS] TOS link generated: ${tosLink.tos_link}`)
            return createErrorResponse(
              `Terms of Service must be accepted before creating accounts. If you just accepted TOS, please wait a moment and try again. Otherwise, please sign the TOS: ${tosLink.tos_link}`,
              400
            )
          } catch (tosError: any) {
            console.error(`[CREATE-ACCOUNTS] Error generating TOS link:`, tosError.message)
            return createErrorResponse(
              `Customer found but TOS must be accepted. Failed to generate TOS link: ${tosError.message || "Unknown error"}. Please try again.`,
              500
            )
          }
        }
        
        console.log(`[CREATE-ACCOUNTS] Customer has accepted TOS. Checking endorsement status...`)
        
        // Check endorsement status before creating virtual accounts
        // Bridge requires endorsements to be "approved" before creating virtual accounts
        let baseEndorsement = customer.endorsements?.find((e: any) => e.name === "base")
        let sepaEndorsement = customer.endorsements?.find((e: any) => e.name === "sepa")
        
        console.log(`[CREATE-ACCOUNTS] Base endorsement status: ${baseEndorsement?.status || 'not found'}`)
        console.log(`[CREATE-ACCOUNTS] SEPA endorsement status: ${sepaEndorsement?.status || 'not found'}`)
        
        // If customer status is "not_started" and endorsements are incomplete, try to update customer with missing fields
        if (customer.status === "not_started" && (baseEndorsement?.status === "incomplete" || sepaEndorsement?.status === "incomplete")) {
          console.log(`[CREATE-ACCOUNTS] Customer status is "not_started" with incomplete endorsements. Attempting to update customer with missing fields...`)
          
          try {
            // Get KYC data to update customer
            const { kycService } = await import("@/lib/kyc-service")
            const submissions = await kycService.getByUserId(user.id, supabase)
            const identitySubmission = submissions.find(s => s.type === "identity")
            const addressSubmission = submissions.find(s => s.type === "address")
            
            if (identitySubmission && addressSubmission) {
              // Extract missing fields from KYC data
              const identityMetadata = identitySubmission.metadata as any
              const addressMetadata = addressSubmission.metadata as any
              
              const updates: any = {}
              
              // Date of birth
              if (identitySubmission.date_of_birth && !customer.date_of_birth) {
                updates.date_of_birth = identitySubmission.date_of_birth
              }
              
              // Tax identification number (SSN)
              if (identityMetadata?.ssn && !customer.tax_identification_number) {
                updates.tax_identification_number = identityMetadata.ssn
              }
              
              // Address
              if (addressMetadata?.address && !customer.address) {
                const structuredAddress = addressMetadata.address
                if (structuredAddress.line1 && structuredAddress.city && structuredAddress.postalCode && structuredAddress.country) {
                  updates.address = {
                    line1: structuredAddress.line1,
                    line2: structuredAddress.line2,
                    city: structuredAddress.city,
                    state: structuredAddress.state,
                    postal_code: structuredAddress.postalCode,
                    country: structuredAddress.country,
                  }
                }
              }
              
              // Signed agreement ID
              if (userProfile.bridge_signed_agreement_id && !customer.signed_agreement_id) {
                updates.signed_agreement_id = userProfile.bridge_signed_agreement_id
              }
              
              if (Object.keys(updates).length > 0) {
                console.log(`[CREATE-ACCOUNTS] Updating customer with missing fields:`, Object.keys(updates))
                const updatedCustomer = await bridgeService.updateCustomer(bridgeCustomerId, updates)
                customer = updatedCustomer
                
                // Refresh endorsement status
                baseEndorsement = customer.endorsements?.find((e: any) => e.name === "base")
                sepaEndorsement = customer.endorsements?.find((e: any) => e.name === "sepa")
                
                console.log(`[CREATE-ACCOUNTS] Customer updated. New status: ${customer.status}, Base endorsement: ${baseEndorsement?.status}, SEPA endorsement: ${sepaEndorsement?.status}`)
                
                // If status is still "not_started" after update, log warning
                // In production, Bridge should process the customer automatically
                if (customer.status === "not_started" && (baseEndorsement?.status === "incomplete" || sepaEndorsement?.status === "incomplete")) {
                  console.warn(`[CREATE-ACCOUNTS] Customer status still "not_started" after update. Bridge may need more time to process the customer.`)
                }
              }
              
              // Continue with account creation if customer is ready
              if (customer.status !== "not_started" || baseEndorsement?.status === "approved" || sepaEndorsement?.status === "approved") {
                try {
                  const { buildBridgeCustomerPayloadFromKyc } = await import("@/lib/bridge-kyc-builder")
                  const customerPayload = await buildBridgeCustomerPayloadFromKyc(
                    user.id,
                    userProfile.bridge_signed_agreement_id!,
                    true, // needsUSD
                    true, // needsEUR
                    supabase
                  )
                      
                  const { initializeBridgeAccount } = await import("@/lib/bridge-onboarding-service")
                  const result = await initializeBridgeAccount({
                    userId: user.id,
                    email: userProfile.email || user.email || '',
                    customerPayload,
                    needsUSD: true,
                    needsEUR: true,
                  })
                      
                  bridgeCustomerId = result.customerId
                  console.log(`[CREATE-ACCOUNTS] Recreated customer with all fields: ${bridgeCustomerId}`)
                  
                  // Refresh customer data
                  customer = await bridgeService.getCustomer(bridgeCustomerId)
                  baseEndorsement = customer.endorsements?.find((e: any) => e.name === "base")
                  sepaEndorsement = customer.endorsements?.find((e: any) => e.name === "sepa")
                  
                  console.log(`[CREATE-ACCOUNTS] After recreation - Status: ${customer.status}, Base endorsement: ${baseEndorsement?.status}, SEPA endorsement: ${sepaEndorsement?.status}`)
                  
                  // Update userProfile with new customer ID
                  userProfile.bridge_customer_id = bridgeCustomerId
                } catch (recreateError: any) {
                  console.error(`[CREATE-ACCOUNTS] Error recreating customer:`, recreateError.message)
                  console.error(`[CREATE-ACCOUNTS] Recreation error stack:`, recreateError.stack)
                  // Continue with existing customer - may still work
                }
              } else {
                console.log(`[CREATE-ACCOUNTS] Customer status is not "not_started" or endorsements are approved - no recreation needed`)
              }
            } else {
              console.log(`[CREATE-ACCOUNTS] No missing fields to update - customer already has all required fields`)
            }
          } catch (updateError: any) {
            console.warn(`[CREATE-ACCOUNTS] Failed to update customer with missing fields (non-critical):`, updateError.message)
            // Continue with virtual account creation attempt
          }
        
        // Poll for endorsement approval if not already approved
        const shouldCreateUSD = !userProfile.bridge_usd_virtual_account_id
        const shouldCreateEUR = !userProfile.bridge_eur_virtual_account_id
        
        if (shouldCreateUSD && baseEndorsement?.status !== "approved") {
            console.log(`[CREATE-ACCOUNTS] Base endorsement not approved (status: ${baseEndorsement?.status || 'not found'}). Polling for approval...`)
            
            // Poll for approval
            let endorsementApproved = false
            let pollAttempts = 0
            const maxPollAttempts = 10 // Poll for up to 30 seconds (3 seconds per attempt)
            
            while (!endorsementApproved && pollAttempts < maxPollAttempts) {
              await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds between polls
              
              try {
                const updatedCustomer = await bridgeService.getCustomer(bridgeCustomerId)
                const updatedBaseEndorsement = updatedCustomer.endorsements?.find((e: any) => e.name === "base")
                
                console.log(`[CREATE-ACCOUNTS] Polling base endorsement (attempt ${pollAttempts + 1}/${maxPollAttempts}): status=${updatedBaseEndorsement?.status || 'not found'}`)
                
                if (updatedBaseEndorsement?.status === "approved") {
                  endorsementApproved = true
                  baseEndorsement = updatedBaseEndorsement
                  customer = updatedCustomer // Update customer object with latest data
                  console.log(`[CREATE-ACCOUNTS] Base endorsement approved!`)
                  break
                }
                
                pollAttempts++
              } catch (pollError: any) {
                console.error(`[CREATE-ACCOUNTS] Error polling endorsement status:`, pollError.message)
                pollAttempts++
              }
            }
            
            if (!endorsementApproved) {
              const missingRequirements = baseEndorsement?.requirements?.missing?.all_of || []
              console.error(`[CREATE-ACCOUNTS] Base endorsement not approved after polling. Missing requirements:`, missingRequirements)
              
              // Log missing requirements - Bridge needs these to approve endorsements
              console.warn(`[CREATE-ACCOUNTS] Base endorsement not approved. Missing requirements: ${missingRequirements.join(', ')}`)
              console.warn(`[CREATE-ACCOUNTS] Customer may need to wait for Bridge to process KYC approval before endorsements can be approved.`)
              
              // Skip USD account creation - endorsement not approved
              results.errors.push(
                `USD account creation failed: Base endorsement not approved (status: ${baseEndorsement?.status || 'not found'}). ` +
                `Missing requirements: ${missingRequirements.join(', ')}. ` +
                `Please wait a moment and try again, or check Bridge dashboard.`
              )
            }
        }
        
        if (shouldCreateEUR && sepaEndorsement?.status !== "approved") {
          console.log(`[CREATE-ACCOUNTS] SEPA endorsement not approved (status: ${sepaEndorsement?.status || 'not found'}). Polling for approval...`)
            
            // Poll for approval
            let endorsementApproved = false
            let pollAttempts = 0
            const maxPollAttempts = 10
            
            while (!endorsementApproved && pollAttempts < maxPollAttempts) {
              await new Promise(resolve => setTimeout(resolve, 3000))
              
              try {
                const updatedCustomer = await bridgeService.getCustomer(bridgeCustomerId)
                const updatedSepaEndorsement = updatedCustomer.endorsements?.find((e: any) => e.name === "sepa")
                
                console.log(`[CREATE-ACCOUNTS] Polling SEPA endorsement (attempt ${pollAttempts + 1}/${maxPollAttempts}): status=${updatedSepaEndorsement?.status || 'not found'}`)
                
                if (updatedSepaEndorsement?.status === "approved") {
                  endorsementApproved = true
                  sepaEndorsement = updatedSepaEndorsement
                  customer = updatedCustomer // Update customer object with latest data
                  console.log(`[CREATE-ACCOUNTS] SEPA endorsement approved!`)
                  break
                }
                
                pollAttempts++
              } catch (pollError: any) {
                console.error(`[CREATE-ACCOUNTS] Error polling endorsement status:`, pollError.message)
                pollAttempts++
              }
            }
            
            if (!endorsementApproved) {
              const missingRequirements = sepaEndorsement?.requirements?.missing?.all_of || []
              console.error(`[CREATE-ACCOUNTS] SEPA endorsement not approved after polling. Missing requirements:`, missingRequirements)
              results.errors.push(
                `EUR account creation failed: SEPA endorsement not approved (status: ${sepaEndorsement?.status || 'not found'}). ` +
                `Missing requirements: ${missingRequirements.join(', ')}. ` +
                `Please wait a moment and try again, or check Bridge dashboard.`
              )
            }
          }
        }
        
        // Refresh customer data one more time to ensure we have the latest endorsement status
        try {
          customer = await bridgeService.getCustomer(bridgeCustomerId)
          baseEndorsement = customer.endorsements?.find((e: any) => e.name === "base")
          sepaEndorsement = customer.endorsements?.find((e: any) => e.name === "sepa")
        } catch (refreshError: any) {
          console.warn(`[CREATE-ACCOUNTS] Could not refresh customer data before account creation:`, refreshError.message)
        }
        
        console.log(`[CREATE-ACCOUNTS] Endorsement checks complete. Proceeding with virtual account creation...`)
      } catch (verifyError: any) {
        console.error(`[CREATE-ACCOUNTS] Customer ${bridgeCustomerId} not found in Bridge. Cannot create virtual accounts.`, verifyError.message)
        // Clear the invalid customer ID
        await supabase
          .from("users")
          .update({
            bridge_customer_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
        return createErrorResponse(
          `Customer ID ${bridgeCustomerId} not found in Bridge. The customer may have been deleted or belongs to a different account. Please try creating accounts again to create a new customer.`,
          404
        )
      }
    } else {
      return createErrorResponse(
        "No valid Bridge customer ID found. Please ensure customer creation completed successfully.",
        400
      )
    }

    // Step 2: Create USD virtual account if it doesn't exist
    // Only create if endorsement is approved
    if (!userProfile.bridge_usd_virtual_account_id) {
      // Refresh customer data if not available
      if (!customer) {
        try {
          customer = await bridgeService.getCustomer(bridgeCustomerId)
        } catch (error: any) {
          console.error(`[CREATE-ACCOUNTS] Could not fetch customer for USD account creation:`, error.message)
        }
      }
      const baseEndorsement = customer?.endorsements?.find((e: any) => e.name === "base")
      
      // Require approved endorsement
      if (baseEndorsement?.status !== "approved") {
        console.log(`[CREATE-ACCOUNTS] Skipping USD virtual account creation - base endorsement not approved (status: ${baseEndorsement?.status || 'not found'})`)
        results.errors.push(`USD account creation skipped: Base endorsement not approved (status: ${baseEndorsement?.status || 'not found'})`)
      } else {
        try {
          console.log(`[CREATE-ACCOUNTS] Creating USD virtual account (walletId: ${results.walletId || 'none'})...`)
        // Add timeout to virtual account creation
        const usdAccount = await Promise.race([
          bridgeService.createVirtualAccount(
            bridgeCustomerId,
            "usd",
            results.walletId
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('USD account creation timed out after 15 seconds')), 15000)
          )
        ]) as any
        console.log(`[CREATE-ACCOUNTS] USD virtual account created: ${usdAccount.id}`)

        await supabase.from("bridge_virtual_accounts").insert({
          user_id: user.id,
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
          .update({
            bridge_usd_virtual_account_id: usdAccount.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
        
        results.usdAccountCreated = true
        results.usdAccountId = usdAccount.id
        results.usdAccountNumber = usdAccount.source_deposit_instructions?.bank_account_number
        results.usdRoutingNumber = usdAccount.source_deposit_instructions?.bank_routing_number
        console.log(`[CREATE-ACCOUNTS] USD virtual account saved to database`)
      } catch (error: any) {
        console.error(`[CREATE-ACCOUNTS] Error creating USD virtual account:`, {
          error: error.message,
          stack: error.stack,
          customerId: bridgeCustomerId,
          walletId: results.walletId,
        })
        results.errors.push(`USD account creation failed: ${error.message}`)
        }
      }
    } else if (userProfile.bridge_usd_virtual_account_id) {
      console.log(`[CREATE-ACCOUNTS] USD virtual account already exists: ${userProfile.bridge_usd_virtual_account_id}`)
      results.usdAccountId = userProfile.bridge_usd_virtual_account_id
    }

    // Step 3: Create EUR virtual account if it doesn't exist
    // Only create if endorsement is approved
    if (!userProfile.bridge_eur_virtual_account_id) {
      // Refresh customer data if not available
      if (!customer) {
        try {
          customer = await bridgeService.getCustomer(bridgeCustomerId)
        } catch (error: any) {
          console.error(`[CREATE-ACCOUNTS] Could not fetch customer for EUR account creation:`, error.message)
        }
      }
      const sepaEndorsement = customer?.endorsements?.find((e: any) => e.name === "sepa")
      
      // Require approved endorsement
      if (sepaEndorsement?.status !== "approved") {
        console.log(`[CREATE-ACCOUNTS] Skipping EUR virtual account creation - sepa endorsement not approved (status: ${sepaEndorsement?.status || 'not found'})`)
        results.errors.push(`EUR account creation skipped: SEPA endorsement not approved (status: ${sepaEndorsement?.status || 'not found'})`)
      } else {
        try {
          console.log(`[CREATE-ACCOUNTS] Creating EUR virtual account (walletId: ${results.walletId || 'none'})...`)
        // Add timeout to virtual account creation
        const eurAccount = await Promise.race([
          bridgeService.createVirtualAccount(
            bridgeCustomerId,
            "eur",
            results.walletId
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('EUR account creation timed out after 15 seconds')), 15000)
          )
        ]) as any
        console.log(`[CREATE-ACCOUNTS] EUR virtual account created: ${eurAccount.id}`)

        await supabase.from("bridge_virtual_accounts").insert({
          user_id: user.id,
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
          .eq("id", user.id)
        
        results.eurAccountCreated = true
        results.eurAccountId = eurAccount.id
        results.eurIban = eurAccount.source_deposit_instructions?.iban
        results.eurBic = eurAccount.source_deposit_instructions?.bic
        console.log(`[CREATE-ACCOUNTS] EUR virtual account saved to database`)
      } catch (error: any) {
        console.error(`[CREATE-ACCOUNTS] Error creating EUR virtual account:`, {
          error: error.message,
          stack: error.stack,
          customerId: bridgeCustomerId,
          walletId: results.walletId,
        })
        results.errors.push(`EUR account creation failed: ${error.message}`)
        }
      }
    } else if (userProfile.bridge_eur_virtual_account_id) {
      console.log(`[CREATE-ACCOUNTS] EUR virtual account already exists: ${userProfile.bridge_eur_virtual_account_id}`)
      results.eurAccountId = userProfile.bridge_eur_virtual_account_id
    }

    // Determine overall success
    // Check if we have partial success (virtual accounts created but wallet skipped)
    const hasErrors = results.errors.length > 0
    const isPartialSuccess = (
      results.usdAccountCreated || 
      results.eurAccountCreated ||
      bridgeCustomerId // At least customer is created/linked
    )
    
    const success = !hasErrors || isPartialSuccess
    
    let message = "Account creation completed"
    if (results.walletSkipped) {
      message = "Virtual accounts created (wallet creation was skipped)"
    } else if (hasErrors && !isPartialSuccess) {
      message = "Account creation completed with errors"
    }
    
    return NextResponse.json({
      success,
      message,
      ...results,
    })
  } catch (error: any) {
    console.error("Error in create-accounts:", error)
    return createErrorResponse(
      `Failed to create accounts: ${error.message || "Unknown error"}`,
      500
    )
  }
})

