/**
 * Test the balance API endpoint directly
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBalanceAPI() {
  // Get a user with Bridge IDs
  const { data: user } = await supabase
    .from('users')
    .select('id, bridge_customer_id, bridge_wallet_id, email')
    .not('bridge_customer_id', 'is', null)
    .not('bridge_wallet_id', 'is', null)
    .limit(1)
    .single()

  if (!user) {
    console.error('No user found with Bridge IDs')
    return
  }

  console.log(`Testing for user: ${user.email}`)
  console.log(`Customer ID: ${user.bridge_customer_id}`)
  console.log(`Wallet ID: ${user.bridge_wallet_id}\n`)

  // Import and test the service
  const { bridgeService } = await import('../lib/bridge-service')
  
  try {
    const balances = await bridgeService.getWalletBalance(
      user.bridge_customer_id!,
      user.bridge_wallet_id!
    )
    
    console.log('✅ Balance API Result:')
    console.log(JSON.stringify(balances, null, 2))
    console.log(`\nUSD: ${balances.USD}`)
    console.log(`EUR: ${balances.EUR}`)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  }
}

testBalanceAPI()

