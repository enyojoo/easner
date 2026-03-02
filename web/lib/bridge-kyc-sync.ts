// Bridge KYC Status Sync
// Syncs KYC status from Bridge to our database when KYC is completed via Bridge widget
// Only syncs status-related fields: bridge_kyc_status, bridge_endorsements, bridge_kyc_rejection_reasons

import { createServerClient } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"

/**
 * Sync Bridge KYC status to our database
 * Only syncs KYC status-related fields (status, endorsements, rejection reasons)
 * This is called when KYC is completed via Bridge widget
 */
export async function syncBridgeKycDataToDatabase(
  customerId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[BRIDGE-KYC-SYNC] Syncing KYC status for customer ${customerId}, user ${userId}`)
    
    // Fetch customer data from Bridge (only need status fields)
    const customerData = await bridgeService.getCustomer(customerId) as any
    
    if (!customerData) {
      throw new Error(`Customer ${customerId} not found in Bridge`)
    }
    
    console.log(`[BRIDGE-KYC-SYNC] Fetched customer data from Bridge:`, {
      customerId: customerData?.id,
      kycStatus: customerData?.kyc_status,
      hasEndorsements: !!customerData?.endorsements,
      hasRejectionReasons: !!customerData?.rejection_reasons,
    })
    
    // Only update KYC status-related fields
    const userUpdates: any = {
      updated_at: new Date().toISOString(),
    }
    
    // Update Bridge-specific KYC status fields only
    if (customerData.kyc_status) {
      userUpdates.bridge_kyc_status = customerData.kyc_status
    }
    if (customerData.endorsements) {
      userUpdates.bridge_endorsements = customerData.endorsements
    }
    if (customerData.rejection_reasons) {
      userUpdates.bridge_kyc_rejection_reasons = customerData.rejection_reasons
    }
    
    // Use server client to bypass RLS for updates
    const supabase = createServerClient()
    
    console.log(`[BRIDGE-KYC-SYNC] Updating user table with KYC status:`, {
      userId,
      kycStatus: userUpdates.bridge_kyc_status,
      hasEndorsements: !!userUpdates.bridge_endorsements,
      hasRejectionReasons: !!userUpdates.bridge_kyc_rejection_reasons,
    })
    
    const { data, error } = await supabase
      .from("users")
      .update(userUpdates)
      .eq("id", userId)
      .select()
    
    if (error) {
      console.error(`[BRIDGE-KYC-SYNC] ❌ Error updating user table:`, error)
      throw new Error(`Failed to update user table: ${error.message}`)
    }
    
    if (!data || data.length === 0) {
      console.error(`[BRIDGE-KYC-SYNC] ❌ No rows updated - user not found or RLS blocking update`)
      throw new Error(`No rows updated for user ${userId}`)
    }
    
    console.log(`[BRIDGE-KYC-SYNC] ✅ Successfully synced Bridge KYC status to database`)
    return { success: true }
  } catch (error: any) {
    console.error(`[BRIDGE-KYC-SYNC] Error syncing Bridge KYC status:`, error)
    return { success: false, error: error.message }
  }
}

