/**
 * Test script to check wallet balance from Bridge API
 * Usage: npx tsx scripts/test-wallet-balance.ts <customerId> <walletId>
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { config } from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY
const BRIDGE_API_BASE_URL = process.env.BRIDGE_API_BASE_URL || 'https://api.bridge.xyz'

if (!BRIDGE_API_KEY) {
  console.error('BRIDGE_API_KEY is not set in environment variables')
  process.exit(1)
}

async function testWalletBalance(customerId: string, walletId: string) {
  console.log(`\n=== Testing Wallet Balance ===`)
  console.log(`Customer ID: ${customerId}`)
  console.log(`Wallet ID: ${walletId}`)
  console.log(`API Base URL: ${BRIDGE_API_BASE_URL}\n`)

  const url = `${BRIDGE_API_BASE_URL}/v0/customers/${customerId}/wallets/${walletId}`
  console.log(`Fetching: ${url}\n`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Response Status: ${response.status} ${response.statusText}`)
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log(`\nRaw Response Text:`)
    console.log(responseText)

    if (!response.ok) {
      console.error(`\n❌ API Error: ${response.status}`)
      return
    }

    const data = JSON.parse(responseText)
    console.log(`\nParsed Response:`)
    console.log(JSON.stringify(data, null, 2))

    // Check if response has data wrapper
    const wallet = (data as any).data || data

    console.log(`\n=== Wallet Analysis ===`)
    console.log(`Wallet ID: ${wallet.id}`)
    console.log(`Chain: ${wallet.chain}`)
    console.log(`Status: ${wallet.status}`)
    console.log(`Has balances field: ${!!wallet.balances}`)
    console.log(`Balances type: ${typeof wallet.balances}`)

    if (wallet.balances) {
      console.log(`\nBalance Keys:`, Object.keys(wallet.balances))
      console.log(`Balance Values:`, Object.values(wallet.balances))
      console.log(`\nAll Balances:`)
      Object.entries(wallet.balances).forEach(([key, value]) => {
        console.log(`  ${key}: ${value} (${typeof value})`)
      })

      // Map balances
      const mapped: { USD: string; EUR: string } = { USD: '0', EUR: '0' }
      Object.entries(wallet.balances).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase()
        const balanceValue = value != null ? String(value) : '0'
        if (lowerKey === 'usdb' || lowerKey === 'usdc') {
          mapped.USD = balanceValue
        } else if (lowerKey === 'eurc') {
          mapped.EUR = balanceValue
        }
      })
      console.log(`\nMapped Balances:`)
      console.log(`  USD: ${mapped.USD}`)
      console.log(`  EUR: ${mapped.EUR}`)
    } else {
      console.log(`\n⚠️  Wallet has no balances field or it's null/undefined`)
      console.log(`This is normal if no funds have been deposited yet.`)
    }

    console.log(`\n✅ Test completed successfully`)
  } catch (error: any) {
    console.error(`\n❌ Error:`, error.message)
    console.error(error.stack)
  }
}

// Get customer ID and wallet ID from command line or database
const args = process.argv.slice(2)

if (args.length >= 2) {
  const [customerId, walletId] = args
  testWalletBalance(customerId, walletId)
} else {
  // Try to get from database
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please provide customerId and walletId as arguments:')
    console.error('Usage: npx tsx scripts/test-wallet-balance.ts <customerId> <walletId>')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get first user with Bridge IDs
  supabase
    .from('users')
    .select('bridge_customer_id, bridge_wallet_id, email')
    .not('bridge_customer_id', 'is', null)
    .not('bridge_wallet_id', 'is', null)
    .limit(1)
    .single()
    .then(({ data, error }) => {
      if (error || !data) {
        console.error('Error fetching user:', error)
        console.error('\nPlease provide customerId and walletId as arguments:')
        console.error('Usage: npx tsx scripts/test-wallet-balance.ts <customerId> <walletId>')
        process.exit(1)
      }

      console.log(`Found user: ${data.email}`)
      testWalletBalance(data.bridge_customer_id, data.bridge_wallet_id)
    })
}

