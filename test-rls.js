// Test RLS Implementation
// Run this with: node test-rls.js
// Make sure to set your environment variables first

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

// Create clients
const anonClient = createClient(supabaseUrl, supabaseAnonKey)
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

async function testRLS() {
  console.log('🧪 Testing RLS Implementation...\n')

  try {
    // Test 1: Anonymous access should be restricted
    console.log('1. Testing anonymous access...')
    const { data: anonData, error: anonError } = await anonClient
      .from('users')
      .select('*')
      .limit(1)
    
    if (anonError) {
      console.log('✅ Anonymous access properly blocked:', anonError.message)
    } else {
      console.log('❌ Anonymous access should be blocked but returned:', anonData)
    }

    // Test 2: Service role should have full access
    console.log('\n2. Testing service role access...')
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (serviceError) {
      console.log('❌ Service role access failed:', serviceError.message)
    } else {
      console.log('✅ Service role access working:', serviceData?.length || 0, 'users found')
    }

    // Test 3: Public data should be accessible
    console.log('\n3. Testing public data access...')
    const { data: currencies, error: currencyError } = await anonClient
      .from('currencies')
      .select('code, name')
      .eq('status', 'active')
      .limit(3)
    
    if (currencyError) {
      console.log('❌ Public data access failed:', currencyError.message)
    } else {
      console.log('✅ Public data access working:', currencies?.length || 0, 'currencies found')
    }

    // Test 4: Check RLS status
    console.log('\n4. Checking RLS status...')
    const { data: rlsStatus, error: rlsError } = await serviceClient
      .rpc('check_rls_status')
      .select('*')
    
    if (rlsError) {
      // Fallback: check directly
      const { data: tables } = await serviceClient
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .eq('schemaname', 'public')
        .in('tablename', ['users', 'currencies', 'transactions', 'recipients'])
      
      console.log('📊 RLS Status:')
      tables?.forEach(table => {
        console.log(`   ${table.tablename}: ${table.rowsecurity ? '✅ Enabled' : '❌ Disabled'}`)
      })
    }

    console.log('\n🎉 RLS testing completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testRLS()
