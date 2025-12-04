// Bridge KYC Data Sync
// Syncs KYC data from Bridge to our database when KYC is completed via Bridge widget

import { supabase } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"

interface BridgeCustomerData {
  id: string
  email?: string
  first_name?: string
  middle_name?: string
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
      hasMiddleName: !!customerData.middle_name,
      hasLastName: !!customerData.last_name,
      hasBirthDate: !!customerData.birth_date,
      hasAddress: !!customerData.residential_address,
      kycStatus: customerData.kyc_status,
    })
    
    // Step 2: Update user table with ALL KYC data
    const userUpdates: any = {
      updated_at: new Date().toISOString(),
    }
    
    // Update name fields - handle first, middle, and last name
    if (customerData.first_name) {
      userUpdates.first_name = customerData.first_name
    }
    if (customerData.middle_name) {
      userUpdates.middle_name = customerData.middle_name
    }
    if (customerData.last_name) {
      userUpdates.last_name = customerData.last_name
    }
    
    // Update date of birth
    if (customerData.birth_date) {
      userUpdates.date_of_birth = customerData.birth_date
    }
    
    // Update address data
    if (customerData.residential_address) {
      const address = customerData.residential_address
      userUpdates.address = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
      ].filter(Boolean).join(", ")
      
      // Store structured address in metadata
      if (!userUpdates.bridge_kyc_metadata) {
        userUpdates.bridge_kyc_metadata = {}
      }
      userUpdates.bridge_kyc_metadata.address = {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      }
      
      // Update country code
      if (address.country) {
        userUpdates.country_code = address.country.substring(0, 2).toLowerCase()
      }
    }
    
    // Update phone if available
    if (customerData.phone) {
      userUpdates.phone = customerData.phone
    }
    
    // Update Bridge-specific KYC fields
    if (customerData.kyc_status) {
      userUpdates.bridge_kyc_status = customerData.kyc_status
    }
    if (customerData.endorsements) {
      userUpdates.bridge_endorsements = customerData.endorsements
    }
    if (customerData.rejection_reasons) {
      userUpdates.bridge_kyc_rejection_reasons = customerData.rejection_reasons
    }
    
    // Store all Bridge KYC metadata in a single JSON field
    const bridgeKycMetadata: any = {
      source: "bridge_kyc_widget",
      bridge_customer_id: customerId,
    }
    
    if (customerData.ssn) bridgeKycMetadata.ssn = customerData.ssn
    if (customerData.passport_number) bridgeKycMetadata.passportNumber = customerData.passport_number
    if (customerData.national_id_number) bridgeKycMetadata.nationalIdNumber = customerData.national_id_number
    if (customerData.dl_number) bridgeKycMetadata.dlNumber = customerData.dl_number
    if (customerData.employment_status) bridgeKycMetadata.employmentStatus = customerData.employment_status
    if (customerData.expected_monthly) bridgeKycMetadata.expectedMonthly = customerData.expected_monthly
    if (customerData.account_purpose) bridgeKycMetadata.accountPurpose = customerData.account_purpose
    if (customerData.source_of_funds) bridgeKycMetadata.sourceOfFunds = customerData.source_of_funds
    if (customerData.most_recent_occupation) bridgeKycMetadata.mostRecentOccupation = customerData.most_recent_occupation
    
    // Merge with existing metadata if it exists
    if (userUpdates.bridge_kyc_metadata) {
      userUpdates.bridge_kyc_metadata = {
        ...userUpdates.bridge_kyc_metadata,
        ...bridgeKycMetadata
      }
    } else {
      userUpdates.bridge_kyc_metadata = bridgeKycMetadata
    }
    
    await supabase
      .from("users")
      .update(userUpdates)
      .eq("id", userId)
    
    console.log(`[BRIDGE-KYC-SYNC] ✅ Updated user table with all Bridge KYC data`)
    
    console.log(`[BRIDGE-KYC-SYNC] ✅ Successfully synced Bridge KYC data to database`)
    return { success: true }
  } catch (error: any) {
    console.error(`[BRIDGE-KYC-SYNC] Error syncing Bridge KYC data:`, error)
    return { success: false, error: error.message }
  }
}

