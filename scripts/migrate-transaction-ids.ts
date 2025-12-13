/**
 * Migration Script: Update BTX- transaction IDs to ETID[8digits] format
 * 
 * This script migrates existing bridge_transactions from the old BTX- format
 * to the new ETID[8digits] format for brand consistency.
 * 
 * Usage: npx tsx scripts/migrate-transaction-ids.ts [--dry-run]
 */

// Load environment variables first
require('dotenv').config({ path: '.env.local' })

// Ensure required env vars are set (anon key is needed for module initialization)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL not found in environment')
  process.exit(1)
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment')
  process.exit(1)
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in environment')
  process.exit(1)
}

// Now import
import { createServerClient } from '../lib/supabase'
import { generateTransactionId } from '../lib/transaction-id'

async function migrateTransactionIds(dryRun: boolean = false) {
  const supabase = createServerClient()

  console.log('🔄 Starting transaction ID migration...')
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will update database)'}`)
  console.log('')

  try {
    // Find all transactions with BTX- prefix
    const { data: transactions, error: fetchError } = await supabase
      .from('bridge_transactions')
      .select('id, transaction_id, bridge_transaction_id, user_id, transaction_type, amount, currency')
      .like('transaction_id', 'BTX-%')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('❌ Error fetching transactions:', fetchError)
      process.exit(1)
    }

    if (!transactions || transactions.length === 0) {
      console.log('✅ No transactions found with BTX- prefix. Migration not needed.')
      process.exit(0)
    }

    console.log(`📊 Found ${transactions.length} transaction(s) to migrate:`)
    console.log('')

    let successCount = 0
    let errorCount = 0
    const updates: Array<{ oldId: string; newId: string; userId: string }> = []

    for (const tx of transactions) {
      let newTransactionId = generateTransactionId()
      let attempts = 0
      const maxAttempts = 10
      let isUnique = false

      // Check for uniqueness and retry if needed
      while (!isUnique && attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('bridge_transactions')
          .select('id')
          .eq('transaction_id', newTransactionId)
          .single()

        if (!existing) {
          isUnique = true
        } else {
          attempts++
          // Wait a bit and regenerate
          await new Promise(resolve => setTimeout(resolve, 10))
          newTransactionId = generateTransactionId()
        }
      }

      if (!isUnique) {
        console.error(`❌ Failed to generate unique ID for transaction ${tx.transaction_id} after ${maxAttempts} attempts`)
        errorCount++
        continue
      }

      updates.push({
        oldId: tx.transaction_id,
        newId: newTransactionId,
        userId: tx.user_id,
      })

      console.log(`  ${tx.transaction_id} → ${newTransactionId} (${tx.transaction_type}, ${tx.currency} ${tx.amount})`)

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from('bridge_transactions')
          .update({ transaction_id: newTransactionId })
          .eq('id', tx.id)

        if (updateError) {
          console.error(`  ❌ Error updating ${tx.transaction_id}:`, updateError.message)
          errorCount++
        } else {
          successCount++
        }
      } else {
        successCount++
      }
    }

    console.log('')
    console.log('📈 Migration Summary:')
    console.log(`  Total transactions: ${transactions.length}`)
    console.log(`  ${dryRun ? 'Would update' : 'Updated'}: ${successCount}`)
    console.log(`  Errors: ${errorCount}`)

    if (dryRun) {
      console.log('')
      console.log('💡 This was a dry run. To apply changes, run without --dry-run flag.')
    } else {
      console.log('')
      console.log('✅ Migration completed!')
    }

    // Show sample of updates
    if (updates.length > 0) {
      console.log('')
      console.log('📋 Sample of updated transaction IDs:')
      updates.slice(0, 5).forEach(({ oldId, newId }) => {
        console.log(`  ${oldId} → ${newId}`)
      })
      if (updates.length > 5) {
        console.log(`  ... and ${updates.length - 5} more`)
      }
    }

  } catch (error: any) {
    console.error('❌ Error during migration:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run') || args.includes('-d')

migrateTransactionIds(dryRun)
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

