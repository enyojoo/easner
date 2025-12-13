/**
 * Script to sync Bridge status and trigger liquidation address sync
 * Usage: npx tsx scripts/sync-status-direct.ts <user-email>
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })
import { createServerClient } from '../lib/supabase'
import { bridgeService } from '../lib/bridge-service'
import { syncBridgeKycDataToDatabase } from '../lib/bridge-kyc-sync'
import { completeAccountSetupAfterKYC } from '../lib/bridge-onboarding-service'

async function syncStatus(userEmail: string) {
  const supabase = createServerClient()

  try {
    // Get user by email
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

    // Fetch latest customer data from Bridge
    console.log('\n📡 Fetching customer data from Bridge...')
    const customerData = await bridgeService.getCustomer(userProfile.bridge_customer_id)
    
    console.log(`KYC Status: ${customerData?.kyc_status}`)
    console.log(`Endorsements: ${customerData?.endorsements?.length || 0}`)

    // Sync KYC data to database
    console.log('\n🔄 Syncing KYC data to database...')
    await syncBridgeKycDataToDatabase(userProfile.id, userProfile.bridge_customer_id, customerData)

    // If KYC is approved, complete account setup (which includes syncing liquidation addresses)
    if (customerData?.kyc_status === 'approved') {
      console.log('\n✅ KYC is approved, completing account setup...')
      await completeAccountSetupAfterKYC(userProfile.id, userProfile.bridge_customer_id)
      console.log('\n✅ Account setup completed! This should have synced liquidation addresses.')
    } else {
      console.log(`\n⏳ KYC status is ${customerData?.kyc_status}, skipping account setup`)
    }

    console.log('\n✅ Sync completed successfully!')
  } catch (error: any) {
    console.error('Error syncing status:', error)
    process.exit(1)
  }
}

// Get user email from command line
const userEmail = process.argv[2]

if (!userEmail) {
  console.error('Usage: npx tsx scripts/sync-status-direct.ts <user-email>')
  process.exit(1)
}

syncStatus(userEmail)
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

