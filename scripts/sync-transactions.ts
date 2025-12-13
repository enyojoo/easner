/**
 * Script to sync liquidation addresses and transactions
 * Usage: npx tsx scripts/sync-transactions.ts <user-email>
 */

// Set env vars before any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || require('dotenv').config({ path: '.env.local' }).parsed?.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || require('dotenv').config({ path: '.env.local' }).parsed?.NEXT_PUBLIC_SUPABASE_ANON_KEY
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || require('dotenv').config({ path: '.env.local' }).parsed?.SUPABASE_SERVICE_ROLE_KEY
process.env.BRIDGE_API_KEY = process.env.BRIDGE_API_KEY || require('dotenv').config({ path: '.env.local' }).parsed?.BRIDGE_API_KEY

// Now import
import { createServerClient } from '../lib/supabase'
import { bridgeLiquidationService } from '../lib/bridge-liquidation-service'
import { syncAllTransactions } from '../lib/bridge-transaction-sync'

async function syncTransactions(userEmail: string) {
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

    if (!userProfile.bridge_wallet_id) {
      console.error('User does not have a Bridge wallet ID')
      process.exit(1)
    }

    console.log(`Bridge Customer ID: ${userProfile.bridge_customer_id}`)
    console.log(`Bridge Wallet ID: ${userProfile.bridge_wallet_id}`)

    // Step 1: Sync liquidation addresses
    console.log('\n📡 Step 1: Syncing liquidation addresses...')
    const liquidationAddresses = await bridgeLiquidationService.listLiquidationAddresses(
      userProfile.bridge_customer_id
    )

    console.log(`Found ${liquidationAddresses.length} liquidation addresses in Bridge`)

    // Filter for wallet deposits
    const walletDepositAddresses = liquidationAddresses.filter(
      (addr) =>
        addr.destination_payment_rail &&
        (addr.destination_payment_rail === 'solana' || addr.destination_payment_rail === 'ethereum')
    )

    if (walletDepositAddresses.length === 0) {
      console.log('No wallet deposit liquidation addresses found')
    } else {
      console.log(`Found ${walletDepositAddresses.length} wallet deposit addresses:`)
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
          console.log(`✅ Storing USDC liquidation address: ${addr.address} (ID: ${addr.id})`)
        } else if (currency === 'eurc') {
          updateData.eurc_liquidation_address = addr.address
          updateData.eurc_liquidation_memo = addr.blockchain_memo || null
          updateData.eurc_liquidation_address_id = addr.id
          console.log(`✅ Storing EURC liquidation address: ${addr.address} (ID: ${addr.id})`)
        }
      }

      // Update the wallet record
      const { error: updateError } = await supabase
        .from('bridge_wallets')
        .update(updateData)
        .eq('bridge_wallet_id', userProfile.bridge_wallet_id)

      if (updateError) {
        console.error('Error updating bridge_wallets:', updateError)
        process.exit(1)
      }

      console.log('✅ Successfully synced liquidation addresses to database!')
    }

    // Step 2: Sync transactions
    console.log('\n📡 Step 2: Syncing transactions...')
    const result = await syncAllTransactions(userProfile.id)

    console.log('\n✅ Sync completed!')
    console.log(`  - Virtual account deposits: ${result.depositsSynced}`)
    console.log(`  - Liquidation drain deposits: ${result.liquidationDrainsSynced}`)
    console.log(`  - Transfers (sends): ${result.transfersSynced}`)
    console.log(`  - Total synced: ${result.depositsSynced + result.liquidationDrainsSynced + result.transfersSynced}`)
  } catch (error: any) {
    console.error('Error syncing transactions:', error)
    process.exit(1)
  }
}

const userEmail = process.argv[2]
if (!userEmail) {
  console.error('Usage: npx tsx scripts/sync-transactions.ts <user-email>')
  process.exit(1)
}

syncTransactions(userEmail).then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })

