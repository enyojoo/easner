// Bridge KYC Data Sync
// Syncs KYC data from Bridge to our database when KYC is completed via Bridge widget

import { supabase } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"
import { kycService } from "@/lib/kyc-service"

interface BridgeCustomerData {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  birth_date?: string
  residential_address?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postal_code: string
    country: string
  }
  kyc_status?: string
  endorsements?: any[]
  rejection_reasons?: any[]
  ssn?: string
  phone?: string
  employment_status?: string
  expected_monthly?: string
  account_purpose?: string
  source_of_funds?: string
  most_recent_occupation?: string
  passport_number?: string
  national_id_number?: string
  dl_number?: string
}

/**
 * Sync Bridge KYC data to our database
 * This is called when KYC is completed via Bridge widget
 */
export async function syncBridgeKycDataToDatabase(
  customerId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[BRIDGE-KYC-SYNC] Syncing KYC data for customer ${customerId}, user ${userId}`)
    
    // Step 1: Fetch full customer data from Bridge
    const customerData = await bridgeService.getCustomer(customerId) as BridgeCustomerData
    
    if (!customerData) {
      throw new Error(`Customer ${customerId} not found in Bridge`)
    }
    
    console.log(`[BRIDGE-KYC-SYNC] Fetched customer data from Bridge:`, {
      hasEmail: !!customerData.email,
      hasFirstName: !!customerData.first_name,
      hasLastName: !!customerData.last_name,
      hasBirthDate: !!customerData.birth_date,
      hasAddress: !!customerData.residential_address,
      kycStatus: customerData.kyc_status,
    })
    
    // Step 2: Update user table with basic info
    const userUpdates: any = {
      updated_at: new Date().toISOString(),
    }
    
    // Update name if available and not already set
    if (customerData.first_name) {
      userUpdates.first_name = customerData.first_name
    }
    if (customerData.last_name) {
      userUpdates.last_name = customerData.last_name
    }
    
    // Update Bridge-specific fields
    if (customerData.kyc_status) {
      userUpdates.bridge_kyc_status = customerData.kyc_status
    }
    if (customerData.endorsements) {
      userUpdates.bridge_endorsements = customerData.endorsements
    }
    if (customerData.rejection_reasons) {
      userUpdates.bridge_kyc_rejection_reasons = customerData.rejection_reasons
    }
    
    await supabase
      .from("users")
      .update(userUpdates)
      .eq("id", userId)
    
    console.log(`[BRIDGE-KYC-SYNC] Updated user table with Bridge data`)
    
    // Step 3: Create or update KYC submissions in our database
    // This allows us to have the data in our kyc_submissions table for consistency
    
    // Get existing submissions
    const existingSubmissions = await kycService.getByUserId(userId)
    const existingIdentity = existingSubmissions.find(s => s.type === "identity")
    const existingAddress = existingSubmissions.find(s => s.type === "address")
    
    // Create/update identity submission if we have name and DOB
    if (customerData.first_name && customerData.last_name && customerData.birth_date) {
      const fullName = `${customerData.first_name} ${customerData.last_name}`
      const countryCode = customerData.residential_address?.country 
        ? customerData.residential_address.country.substring(0, 2).toLowerCase()
        : undefined
      
      // Build metadata with Bridge-specific fields
      const metadata: any = {
        source: "bridge_kyc_widget",
        bridge_customer_id: customerId,
      }
      
      if (customerData.ssn) metadata.ssn = customerData.ssn
      if (customerData.passport_number) metadata.passportNumber = customerData.passport_number
      if (customerData.national_id_number) metadata.nationalIdNumber = customerData.national_id_number
      if (customerData.dl_number) metadata.dlNumber = customerData.dl_number
      if (customerData.phone) metadata.phone = customerData.phone
      if (customerData.employment_status) metadata.employmentStatus = customerData.employment_status
      if (customerData.expected_monthly) metadata.expectedMonthly = customerData.expected_monthly
      if (customerData.account_purpose) metadata.accountPurpose = customerData.account_purpose
      if (customerData.source_of_funds) metadata.sourceOfFunds = customerData.source_of_funds
      if (customerData.most_recent_occupation) metadata.mostRecentOccupation = customerData.most_recent_occupation
      
      if (existingIdentity) {
        // Update existing identity submission
        await supabase
          .from("kyc_submissions")
          .update({
            full_name: fullName,
            date_of_birth: customerData.birth_date,
            country_code: countryCode,
            metadata: metadata,
            status: customerData.kyc_status === "approved" ? "approved" : 
                   customerData.kyc_status === "rejected" ? "rejected" : 
                   customerData.kyc_status === "under_review" ? "in_review" : "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingIdentity.id)
        
        console.log(`[BRIDGE-KYC-SYNC] Updated existing identity submission`)
      } else {
        // Create new identity submission
        await supabase
          .from("kyc_submissions")
          .insert({
            user_id: userId,
            type: "identity",
            full_name: fullName,
            date_of_birth: customerData.birth_date,
            country_code: countryCode,
            metadata: metadata,
            status: customerData.kyc_status === "approved" ? "approved" : 
                   customerData.kyc_status === "rejected" ? "rejected" : 
                   customerData.kyc_status === "under_review" ? "in_review" : "pending",
          })
        
        console.log(`[BRIDGE-KYC-SYNC] Created new identity submission from Bridge data`)
      }
    }
    
    // Create/update address submission if we have address data
    if (customerData.residential_address) {
      const address = customerData.residential_address
      const addressText = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
      ].filter(Boolean).join(", ")
      
      const countryCode = address.country.substring(0, 2).toLowerCase()
      
      if (existingAddress) {
        // Update existing address submission
        await supabase
          .from("kyc_submissions")
          .update({
            address: addressText,
            country_code: countryCode,
            metadata: {
              source: "bridge_kyc_widget",
              bridge_customer_id: customerId,
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country,
            },
            status: customerData.kyc_status === "approved" ? "approved" : 
                   customerData.kyc_status === "rejected" ? "rejected" : 
                   customerData.kyc_status === "under_review" ? "in_review" : "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAddress.id)
        
        console.log(`[BRIDGE-KYC-SYNC] Updated existing address submission`)
      } else {
        // Create new address submission
        await supabase
          .from("kyc_submissions")
          .insert({
            user_id: userId,
            type: "address",
            address: addressText,
            country_code: countryCode,
            metadata: {
              source: "bridge_kyc_widget",
              bridge_customer_id: customerId,
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country,
            },
            status: customerData.kyc_status === "approved" ? "approved" : 
                   customerData.kyc_status === "rejected" ? "rejected" : 
                   customerData.kyc_status === "under_review" ? "in_review" : "pending",
          })
        
        console.log(`[BRIDGE-KYC-SYNC] Created new address submission from Bridge data`)
      }
    }
    
    console.log(`[BRIDGE-KYC-SYNC] ✅ Successfully synced Bridge KYC data to database`)
    return { success: true }
  } catch (error: any) {
    console.error(`[BRIDGE-KYC-SYNC] Error syncing Bridge KYC data:`, error)
    return { success: false, error: error.message }
  }
}

