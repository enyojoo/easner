/**
 * Script to sync Bridge status - loads env vars properly
 * Usage: npx tsx scripts/run-sync-status.ts <user-email>
 */

// Set env vars before any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || require('dotenv').config({ path: '.env.local' }).parsed?.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || require('dotenv').config({ path: '.env.local' }).parsed?.NEXT_PUBLIC_SUPABASE_ANON_KEY
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || require('dotenv').config({ path: '.env.local' }).parsed?.SUPABASE_SERVICE_ROLE_KEY
process.env.BRIDGE_API_KEY = process.env.BRIDGE_API_KEY || require('dotenv').config({ path: '.env.local' }).parsed?.BRIDGE_API_KEY

// Now import
import { createServerClient } from '../lib/supabase'
import { bridgeService } from '../lib/bridge-service'
import { syncBridgeKycDataToDatabase } from '../lib/bridge-kyc-sync'
import { completeAccountSetupAfterKYC } from '../lib/bridge-onboarding-service'

async function syncStatus(userEmail: string) {
  const supabase = createServerClient()

  try {
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id, email, bridge_customer_id, bridge_wallet_id')
      .eq('email', userEmail)
      .single()

    if (userError || !userProfile) {
      console.error('Error finding user:', userError)
      process.exit(1)
    }

    console.log(`Found user: ${userProfile.email} (ID: ${userProfile.id})`)

    if (!userProfile.bridge_customer_id) {
      console.error('User does not have a Bridge customer ID')
      process.exit(1)
    }

    console.log(`Bridge Customer ID: ${userProfile.bridge_customer_id}`)

    console.log('\n📡 Fetching customer data from Bridge...')
    const customerData = await bridgeService.getCustomer(userProfile.bridge_customer_id)
    
    // Derive KYC status from customer data (same logic as sync-status route)
    let kycStatus: string | undefined = undefined
    if (customerData.kyc_status) {
      kycStatus = customerData.kyc_status
    } else if (customerData.status === 'active') {
      const endorsements = customerData.endorsements || []
      const hasApprovedEndorsement = endorsements.some((e: any) => e.status === 'approved')
      if (hasApprovedEndorsement) {
        kycStatus = 'approved'
      } else {
        kycStatus = 'pending'
      }
    } else if (customerData.status === 'rejected') {
      kycStatus = 'rejected'
    } else if (customerData.endorsements && Array.isArray(customerData.endorsements)) {
      const endorsements = customerData.endorsements
      const hasApprovedEndorsement = endorsements.some((e: any) => e.status === 'approved')
      if (hasApprovedEndorsement) {
        kycStatus = 'approved'
      }
    }

    console.log(`KYC Status: ${kycStatus || 'unknown'}`)
    console.log(`Customer Status: ${customerData?.status}`)
    console.log(`Endorsements: ${customerData?.endorsements?.length || 0}`)

    console.log('\n🔄 Syncing KYC data to database...')
    // Function signature: syncBridgeKycDataToDatabase(customerId, userId)
    await syncBridgeKycDataToDatabase(userProfile.bridge_customer_id, userProfile.id)

    if (kycStatus === 'approved') {
      console.log('\n✅ KYC is approved, completing account setup (this will sync liquidation addresses)...')
      await completeAccountSetupAfterKYC(userProfile.id, userProfile.bridge_customer_id)
      console.log('\n✅ Account setup completed! Liquidation addresses should now be synced.')
    } else {
      console.log(`\n⏳ KYC status is ${customerData?.kyc_status}, skipping account setup`)
    }

    console.log('\n✅ Sync completed successfully!')
  } catch (error: any) {
    console.error('Error syncing status:', error)
    process.exit(1)
  }
}

const userEmail = process.argv[2]
if (!userEmail) {
  console.error('Usage: npx tsx scripts/run-sync-status.ts <user-email>')
  process.exit(1)
}

syncStatus(userEmail).then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })

