/**
 * Script to sync liquidation addresses from Bridge to database
 * Usage: npx tsx scripts/sync-liquidation-addresses.ts <user-email>
 */

// Load environment variables
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'
import { bridgeLiquidationService } from '../lib/bridge-liquidation-service'
import { createServerClient } from '../lib/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

async function syncLiquidationAddresses(userEmail: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const serverSupabase = createServerClient()

  try {
    // Get user by email
    const { data: userProfile, error: userError } = await serverSupabase
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

    if (!userProfile.bridge_wallet_id) {
      console.error('User does not have a Bridge wallet ID')
      process.exit(1)
    }

    console.log(`Bridge Customer ID: ${userProfile.bridge_customer_id}`)
    console.log(`Bridge Wallet ID: ${userProfile.bridge_wallet_id}`)

    // Fetch all liquidation addresses from Bridge
    const liquidationAddresses = await bridgeLiquidationService.listLiquidationAddresses(
      userProfile.bridge_customer_id
    )

    console.log(`\nFound ${liquidationAddresses.length} liquidation addresses in Bridge`)

    // Filter for wallet deposits
    const walletDepositAddresses = liquidationAddresses.filter(
      (addr) =>
        addr.destination_payment_rail &&
        (addr.destination_payment_rail === 'solana' || addr.destination_payment_rail === 'ethereum')
    )

    if (walletDepositAddresses.length === 0) {
      console.log('No wallet deposit liquidation addresses found')
      return
    }

    console.log(`\nFound ${walletDepositAddresses.length} wallet deposit addresses:`)
    walletDepositAddresses.forEach((addr) => {
      console.log(`  - ${addr.currency.toUpperCase()} on ${addr.chain}: ${addr.address}`)
    })

    // Update bridge_wallets table with liquidation addresses
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    for (const addr of walletDepositAddresses) {
      const currency = addr.currency.toLowerCase()

      if (currency === 'usdc') {
        updateData.usdc_liquidation_address = addr.address
        updateData.usdc_liquidation_memo = addr.blockchain_memo || null
        updateData.usdc_liquidation_address_id = addr.id
        console.log(`\n✅ Storing USDC liquidation address: ${addr.address}`)
      } else if (currency === 'eurc') {
        updateData.eurc_liquidation_address = addr.address
        updateData.eurc_liquidation_memo = addr.blockchain_memo || null
        updateData.eurc_liquidation_address_id = addr.id
        console.log(`\n✅ Storing EURC liquidation address: ${addr.address}`)
      }
    }

    // Update the wallet record
    const { error: updateError } = await serverSupabase
      .from('bridge_wallets')
      .update(updateData)
      .eq('bridge_wallet_id', userProfile.bridge_wallet_id)

    if (updateError) {
      console.error('Error updating bridge_wallets:', updateError)
      process.exit(1)
    }

    console.log(`\n✅ Successfully synced liquidation addresses to database!`)
  } catch (error: any) {
    console.error('Error syncing liquidation addresses:', error)
    process.exit(1)
  }
}

// Get user email from command line
const userEmail = process.argv[2]

if (!userEmail) {
  console.error('Usage: npx tsx scripts/sync-liquidation-addresses.ts <user-email>')
  process.exit(1)
}

syncLiquidationAddresses(userEmail)
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

