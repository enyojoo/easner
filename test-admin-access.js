// Test Admin Access
// Run this to test if admin_users table is accessible

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

async function testAdminAccess() {
  console.log('🧪 Testing Admin Access...\n')

  try {
    // Test 1: Check if we can access admin_users table
    console.log('1. Testing admin_users table access...')
    const { data: adminUsers, error: adminError } = await serviceClient
      .from('admin_users')
      .select('*')
    
    if (adminError) {
      console.log('❌ Admin users access failed:', adminError.message)
      console.log('Error details:', adminError)
    } else {
      console.log('✅ Admin users access working:', adminUsers?.length || 0, 'admin users found')
      if (adminUsers && adminUsers.length > 0) {
        console.log('Sample admin user:', {
          id: adminUsers[0].id,
          email: adminUsers[0].email,
          status: adminUsers[0].status
        })
      }
    }

    // Test 2: Check RLS status
    console.log('\n2. Checking RLS status...')
    const { data: rlsStatus, error: rlsError } = await serviceClient
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', 'admin_users')
    
    if (rlsError) {
      console.log('❌ RLS status check failed:', rlsError.message)
    } else {
      console.log('📊 RLS Status for admin_users:')
      rlsStatus?.forEach(table => {
        console.log(`   ${table.tablename}: ${table.rowsecurity ? '✅ Enabled' : '❌ Disabled'}`)
      })
    }

    // Test 3: Check policies
    console.log('\n3. Checking policies...')
    const { data: policies, error: policyError } = await serviceClient
      .from('pg_policies')
      .select('policyname, cmd, roles')
      .eq('schemaname', 'public')
      .eq('tablename', 'admin_users')
    
    if (policyError) {
      console.log('❌ Policy check failed:', policyError.message)
    } else {
      console.log('📋 Policies for admin_users:')
      policies?.forEach(policy => {
        console.log(`   ${policy.policyname}: ${policy.cmd} (roles: ${policy.roles})`)
      })
    }

    // Test 4: Test specific admin user lookup
    console.log('\n4. Testing specific admin user lookup...')
    if (adminUsers && adminUsers.length > 0) {
      const testEmail = adminUsers[0].email
      const { data: specificAdmin, error: specificError } = await serviceClient
        .from('admin_users')
        .select('*')
        .eq('email', testEmail)
        .eq('status', 'active')
        .single()
      
      if (specificError) {
        console.log('❌ Specific admin lookup failed:', specificError.message)
      } else {
        console.log('✅ Specific admin lookup working:', specificAdmin?.email)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAdminAccess()
