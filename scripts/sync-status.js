/**
 * Script to sync Bridge status and liquidation addresses
 * Usage: node scripts/sync-status.js <user-email>
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const { bridgeService } = require('../lib/bridge-service')
const { syncBridgeKycDataToDatabase } = require('../lib/bridge-kyc-sync')
const { completeAccountSetupAfterKYC } = require('../lib/bridge-onboarding-service')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables')
  process.exit(1)
}

async function syncStatus(userEmail) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
      console.log('\n✅ Account setup completed!')
    } else {
      console.log(`\n⏳ KYC status is ${customerData?.kyc_status}, skipping account setup`)
    }

    console.log('\n✅ Sync completed successfully!')
  } catch (error) {
    console.error('Error syncing status:', error)
    process.exit(1)
  }
}

// Get user email from command line
const userEmail = process.argv[2]

if (!userEmail) {
  console.error('Usage: node scripts/sync-status.js <user-email>')
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

