// Bridge Transaction Sync Service
// Syncs historical transactions from Bridge API to bridge_transactions table

import { createServerClient } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"
import { bridgeTransactionService } from "@/lib/bridge-transaction-service"
import { bridgeLiquidationService, type LiquidationDrain } from "@/lib/bridge-liquidation-service"

// Sync lock to prevent concurrent syncs for the same user
const syncLocks = new Map<string, Promise<{ depositsSynced: number; liquidationDrainsSynced: number; transfersSynced: number }>>()

// Status hierarchy - only update forward, never backward
// Only track two statuses: funds_received (Processing) and payment_processed (Completed)
const STATUS_HIERARCHY: Record<string, number> = {
  'funds_received': 1, // Processing
  'payment_processed': 2, // Completed
}

/**
 * Get status priority (higher = more advanced)
 */
function getStatusPriority(status: string): number {
  return STATUS_HIERARCHY[status.toLowerCase()] || 0
}

/**
 * Check if newStatus is forward progress from currentStatus
 */
function isStatusForward(currentStatus: string, newStatus: string): boolean {
  const currentPriority = getStatusPriority(currentStatus)
  const newPriority = getStatusPriority(newStatus)
  return newPriority > currentPriority
}

/**
 * Sync historical virtual account activities (deposits) for a user
 */
export async function syncVirtualAccountTransactions(
  userId: string,
  customerId: string,
  virtualAccountId: string,
  currency: string
): Promise<number> {
  const serverClient = createServerClient()
  let syncedCount = 0

  try {
    console.log(`[SYNC-TX] Syncing virtual account transactions for user ${userId}, account ${virtualAccountId}`)
    
    // Fetch activity history from Bridge
    const activities = await bridgeService.getVirtualAccountHistory(customerId, virtualAccountId)
    
    console.log(`[SYNC-TX] Found ${activities.length} activities from Bridge API`)

    // Process ALL transaction statuses - create transaction on first status, update on status changes
    // This allows users to see transaction progress in real-time
    // 
    // Only track two statuses:
    // - funds_received: Bridge received funds (Processing)
    // - payment_processed: Payment confirmed on-chain (Completed)
    // 
    // Non-transaction types to exclude:
    // - account_update: Virtual Account was updated (amount is 0.0)
    // - deactivation: Virtual Account was deactivated
    // - reactivation: Virtual Account was reactivated
    // - microdeposit: Microdeposit verification (funds are never onramped, amount can be < $1)
    // - funds_scheduled: Incoming funds are in transit (intermediate status - skip)
    // - payment_submitted: Bridge submitted the crypto payment (intermediate status - skip)
    // - in_review: Transaction is under manual review (intermediate status - skip)
    // - refunded: Funds could not be delivered and were refunded (intermediate status - skip)
    const transactionTypes = [
      'funds_received', // Processing
      'payment_processed', // Completed
    ]
    
    const nonTransactionTypes = [
      'account_update',
      'deactivation',
      'reactivation',
      'microdeposit',
    ]
    
    // Process all transaction statuses - we'll update the same transaction as status changes
    const depositActivities = activities.filter((activity) => {
      const activityType = activity.type || activity.status || ''
      
      // Explicitly exclude non-transaction types
      if (nonTransactionTypes.includes(activityType)) {
        return false
      }
      
      // Include all transaction types (not just payment_processed)
      const isTransaction = transactionTypes.includes(activityType)
      
      // Require positive amount
      const hasAmount = parseFloat(activity.amount || '0') > 0
      
      return isTransaction && hasAmount
    })

    console.log(`[SYNC-TX] Filtered to ${depositActivities.length} deposit transactions (skipped ${activities.length - depositActivities.length} non-transaction activities)`)

    // Normalize currency: usdc -> USD, eurc -> EUR
    const normalizeCurrency = (curr: string): string => {
      const lower = (curr || '').toLowerCase()
      if (lower === 'usdc' || lower === 'usd') return 'USD'
      if (lower === 'eurc' || lower === 'eur') return 'EUR'
      return curr?.toUpperCase() || currency
    }

    // Process activities in chronological order (oldest first) to ensure we create transaction on first status
    // Then update it as status progresses
    const sortedActivities = [...depositActivities].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      return timeA - timeB
    })

    // Track processed activities to prevent duplicates within same sync run
    const processedActivityIds = new Set<string>()
    // Track processed deposit_ids to prevent creating multiple transactions for same deposit
    const processedDepositIds = new Set<string>()

    for (const activity of sortedActivities) {
      try {
        const activityCurrency = normalizeCurrency(activity.currency || currency)
        const activityAmount = parseFloat(activity.amount || '0')
        const activityStatus = activity.type || activity.status || 'funds_received'
        
        // Only process two statuses: funds_received (Processing) and payment_processed (Completed)
        // Skip all intermediate statuses (funds_scheduled, payment_submitted, in_review, etc.)
        const validStatuses = ['funds_received', 'payment_processed']
        if (!validStatuses.includes(activityStatus.toLowerCase())) {
          console.log(`[SYNC-TX] Skipping activity ${activity.id} with status ${activityStatus} (only tracking funds_received and payment_processed)`)
          processedActivityIds.add(activity.id)
          continue
        }
        
        // Skip if we've already processed this activity in this sync run
        if (processedActivityIds.has(activity.id)) {
          console.log(`[SYNC-TX] Skipping already processed activity in this sync: ${activity.id}`)
          continue
        }
        
        // Skip if we've already processed a transaction with this deposit_id in this sync run
        // This prevents creating multiple transactions for the same deposit when Bridge sends
        // multiple activities (different activity.id) for different statuses of the same deposit
        if (activity.deposit_id && processedDepositIds.has(activity.deposit_id)) {
          console.log(`[SYNC-TX] Skipping activity ${activity.id} - deposit_id ${activity.deposit_id} already processed in this sync`)
          // Still check if we need to update the existing transaction
          const serverClient = createServerClient()
          const { data: existing } = await serverClient
            .from('bridge_transactions')
            .select('*')
            .eq('deposit_id', activity.deposit_id)
            .eq('user_id', userId)
            .eq('transaction_type', 'receive')
            .maybeSingle()
          
          if (existing) {
            const statusChanged = existing.status !== activityStatus
            const statusIsForward = isStatusForward(existing.status, activityStatus)
            const hasNewReceiptInfo = activity.receipt?.final_amount || activity.receipt?.destination_tx_hash
            
            if ((statusChanged && statusIsForward) || hasNewReceiptInfo) {
              const statusToUpdate = statusIsForward ? activityStatus : existing.status
              await bridgeTransactionService.updateTransactionStatus(
                existing.transaction_id, // Use transaction_id (internal ID) to update the same row
                statusToUpdate,
                {
                  receiptFinalAmount: activity.receipt?.final_amount ? parseFloat(activity.receipt.final_amount) : undefined,
                  receiptDestinationTxHash: activity.receipt?.destination_tx_hash,
                  completedAt: activityStatus === 'payment_processed' ? (activity.updated_at || activity.created_at) : undefined,
                  metadata: activity,
                  activityId: activity.id, // Update activity_id and bridge_transaction_id to latest activity.id
                }
              )
              console.log(`[SYNC-TX] Updated transaction ${existing.transaction_id} status: ${existing.status} → ${statusToUpdate}`)
            }
          }
          processedActivityIds.add(activity.id)
          continue
        }
        
        // PRIMARY: Check by deposit_id first (if available) - this is the most reliable way to group same transaction
        // Bridge may return different activity.id values for different statuses of the same deposit
        let existing = null
        if (activity.deposit_id) {
          const serverClient = createServerClient()
          const { data } = await serverClient
            .from('bridge_transactions')
            .select('*')
            .eq('deposit_id', activity.deposit_id)
            .eq('user_id', userId)
            .eq('transaction_type', 'receive')
            .maybeSingle()
          
          if (data) {
            existing = data
            console.log(`[SYNC-TX] Found existing transaction by deposit_id ${activity.deposit_id}: ${existing.transaction_id}`)
          }
        }
        
        // FALLBACK 1: Check by bridge_transaction_id (activity.id) if deposit_id check didn't find anything
        if (!existing) {
          existing = await bridgeTransactionService.getTransactionByBridgeId(activity.id)
        }
        
        // FALLBACK 2: Check by amount + currency + created_at (within 5 seconds) if no deposit_id
        // This catches duplicates where deposit_id might be missing
        if (!existing && !activity.deposit_id) {
          const serverClient = createServerClient()
          const activityCreatedAt = new Date(activity.created_at || 0)
          const timeWindowStart = new Date(activityCreatedAt.getTime() - 5000) // 5 seconds before
          const timeWindowEnd = new Date(activityCreatedAt.getTime() + 5000) // 5 seconds after
          
          const { data: similarTx } = await serverClient
            .from('bridge_transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('transaction_type', 'receive')
            .eq('amount', activityAmount.toString())
            .eq('currency', activityCurrency.toLowerCase())
            .gte('created_at', timeWindowStart.toISOString())
            .lte('created_at', timeWindowEnd.toISOString())
            .maybeSingle()
          
          if (similarTx) {
            existing = similarTx
            console.log(`[SYNC-TX] Found existing transaction by amount+currency+time: ${similarTx.transaction_id}`)
          }
        }

        if (existing) {
          // Transaction exists - only update if status moves forward or if receipt info is available
          const statusChanged = existing.status !== activityStatus
          const statusIsForward = isStatusForward(existing.status, activityStatus)
          const hasNewReceiptInfo = activity.receipt?.final_amount || activity.receipt?.destination_tx_hash
          
          // Only update if:
          // 1. Status changed AND it's forward progress, OR
          // 2. Receipt info is available (even if status unchanged)
          if ((statusChanged && statusIsForward) || hasNewReceiptInfo) {
            if (statusChanged && statusIsForward) {
              console.log(`[SYNC-TX] Updating transaction ${existing.transaction_id} status: ${existing.status} → ${activityStatus}`)
            } else if (statusChanged && !statusIsForward) {
              console.log(`[SYNC-TX] Skipping backward status update: ${existing.status} → ${activityStatus} (keeping ${existing.status})`)
            } else {
              console.log(`[SYNC-TX] Updating transaction ${existing.transaction_id} receipt info`)
            }
            
            // Only update status if it's forward progress
            const statusToUpdate = statusIsForward ? activityStatus : existing.status
            
            await bridgeTransactionService.updateTransactionStatus(
              existing.transaction_id, // Use transaction_id (internal ID) to update the same row
              statusToUpdate,
              {
                receiptFinalAmount: activity.receipt?.final_amount ? parseFloat(activity.receipt.final_amount) : undefined,
                receiptDestinationTxHash: activity.receipt?.destination_tx_hash,
                completedAt: activityStatus === 'payment_processed' ? (activity.updated_at || activity.created_at) : undefined,
                metadata: activity, // Update metadata with latest activity info
                activityId: activity.id, // Update activity_id and bridge_transaction_id to latest activity.id
              }
            )
            syncedCount++
          }
          // Mark as processed to prevent duplicate processing
          processedActivityIds.add(activity.id)
          if (activity.deposit_id) {
            processedDepositIds.add(activity.deposit_id) // Mark deposit_id as processed
          }
          continue
        }

        // Transaction doesn't exist - but DOUBLE-CHECK by deposit_id before creating
        // This prevents race conditions where multiple activities with same deposit_id but different activity.id
        // try to create transactions simultaneously
        if (activity.deposit_id) {
          const serverClient = createServerClient()
          const { data: doubleCheck } = await serverClient
            .from('bridge_transactions')
            .select('*')
            .eq('deposit_id', activity.deposit_id)
            .eq('user_id', userId)
            .eq('transaction_type', 'receive')
            .maybeSingle()
          
          if (doubleCheck) {
            // Transaction was created by another activity with same deposit_id
            // Update it instead of creating a new one
            console.log(`[SYNC-TX] Found existing transaction by deposit_id (double-check) ${activity.deposit_id}: ${doubleCheck.transaction_id}`)
            const statusChanged = doubleCheck.status !== activityStatus
            const statusIsForward = isStatusForward(doubleCheck.status, activityStatus)
            const hasNewReceiptInfo = activity.receipt?.final_amount || activity.receipt?.destination_tx_hash
            
            if ((statusChanged && statusIsForward) || hasNewReceiptInfo) {
              const statusToUpdate = statusIsForward ? activityStatus : doubleCheck.status
              await bridgeTransactionService.updateTransactionStatus(
                doubleCheck.bridge_transaction_id,
                statusToUpdate,
                {
                  receiptFinalAmount: activity.receipt?.final_amount ? parseFloat(activity.receipt.final_amount) : undefined,
                  receiptDestinationTxHash: activity.receipt?.destination_tx_hash,
                  completedAt: activityStatus === 'payment_processed' ? (activity.updated_at || activity.created_at) : undefined,
                  metadata: activity,
                }
              )
              syncedCount++
            }
            processedActivityIds.add(activity.id)
            continue
          }
        }
        
        // Transaction doesn't exist - create it with current status
        // This will be the first status we see for this deposit
        // Use activity.id as bridge_transaction_id (will be updated to latest activity.id when status changes)
        const bridgeTransactionId = activity.id
        
        await bridgeTransactionService.createDepositTransaction({
          userId,
          bridgeActivityId: bridgeTransactionId,
          virtualAccountId: virtualAccountId,
          amount: activityAmount,
          currency: activityCurrency, // Normalized currency (usdc -> USD)
          status: activityStatus, // Current status (could be funds_scheduled, funds_received, etc.)
          depositId: activity.deposit_id, // Store deposit_id for future status updates
          recipientName: activity.source?.sender_name,
          sourcePaymentRail: activity.source?.payment_rail,
          receiptFinalAmount: activity.receipt?.final_amount ? parseFloat(activity.receipt.final_amount) : undefined,
          receiptDestinationTxHash: activity.receipt?.destination_tx_hash,
          reference: activity.reference || activity.memo,
          metadata: activity,
          bridgeCreatedAt: activity.created_at,
        })
        syncedCount++
        // Mark as processed to prevent duplicate processing
        processedActivityIds.add(activity.id)
        if (activity.deposit_id) {
          processedDepositIds.add(activity.deposit_id) // Mark deposit_id as processed to prevent duplicates
        }
        console.log(`[SYNC-TX] Created deposit transaction: ${bridgeTransactionId}, deposit_id: ${activity.deposit_id || 'none'}, amount: ${activityAmount} ${activityCurrency}, status: ${activityStatus} (will update activity.id when status changes)`)
      } catch (error: any) {
        // Check if it's a duplicate key error (race condition)
        if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
          console.log(`[SYNC-TX] Deposit transaction already exists (duplicate key): ${activity.id}, attempting update...`)
          // Try to find and update instead
          try {
            let existing = null
            if (activity.deposit_id) {
              const serverClient = createServerClient()
              const { data } = await serverClient
                .from('bridge_transactions')
                .select('*')
                .eq('deposit_id', activity.deposit_id)
                .eq('user_id', userId)
                .eq('transaction_type', 'receive')
                .maybeSingle()
              
              if (data) existing = data
            }
            
            if (!existing) {
              existing = await bridgeTransactionService.getTransactionByBridgeId(activity.id)
            }
            
            if (existing) {
              const activityStatus = activity.type || activity.status || 'funds_received'
              if (existing.status !== activityStatus) {
                await bridgeTransactionService.updateTransactionStatus(
                  existing.bridge_transaction_id,
                  activityStatus,
                  {
                    receiptFinalAmount: activity.receipt?.final_amount ? parseFloat(activity.receipt.final_amount) : undefined,
                    receiptDestinationTxHash: activity.receipt?.destination_tx_hash,
                    completedAt: activityStatus === 'payment_processed' ? (activity.updated_at || activity.created_at) : undefined,
                    metadata: activity,
                  }
                )
                syncedCount++
              }
            }
          } catch (updateError) {
            console.error(`[SYNC-TX] Error updating transaction after duplicate key:`, updateError)
          }
          continue
        }
        console.error(`[SYNC-TX] Error syncing activity ${activity.id}:`, error.message)
        // Continue with next activity
      }
    }
  } catch (error: any) {
    console.error(`[SYNC-TX] Error syncing virtual account transactions:`, error.message)
    throw error
  }

  console.log(`[SYNC-TX] Synced ${syncedCount} virtual account transactions`)
  return syncedCount
}

/**
 * Sync historical transfers (sends) for a user
 */
export async function syncTransferTransactions(
  userId: string,
  customerId: string
): Promise<number> {
  let syncedCount = 0

  try {
    console.log(`[SYNC-TX] Syncing transfer transactions for user ${userId}, customer ${customerId}`)
    
    // Fetch transfers from Bridge
    const transfers = await bridgeService.listTransfers(customerId, { limit: 100 })
    
    console.log(`[SYNC-TX] Found ${transfers.length} transfers from Bridge API`)

    for (const transfer of transfers) {
      try {
        // Check if transaction already exists
        const existing = await bridgeTransactionService.getTransactionByBridgeId(transfer.id)
        
        if (existing) {
          // Update existing transaction if status changed
          if (existing.status !== (transfer.state || transfer.status)) {
            await bridgeTransactionService.updateTransactionStatus(
              transfer.id,
              transfer.state || transfer.status || 'awaiting_funds',
              {
                receiptFinalAmount: transfer.receipt?.final_amount ? parseFloat(transfer.receipt.final_amount) : undefined,
                receiptTraceNumber: transfer.receipt?.trace_number,
                receiptImad: transfer.receipt?.imad,
                receiptDestinationTxHash: transfer.receipt?.destination_tx_hash,
                completedAt: (transfer.state === 'payment_processed' || transfer.state === 'completed') ? transfer.updated_at : undefined,
                metadata: transfer,
              }
            )
            syncedCount++
          }
          continue
        }

        // Get user's wallet ID
        const serverClient = createServerClient()
        const { data: wallet } = await serverClient
          .from('bridge_wallets')
          .select('bridge_wallet_id')
          .eq('user_id', userId)
          .single()

        // Create new send transaction
        await bridgeTransactionService.createSendTransaction({
          userId,
          bridgeTransferId: transfer.id,
          amount: parseFloat(transfer.amount),
          currency: transfer.currency,
          status: transfer.state || transfer.status || 'awaiting_funds',
          sourceWalletId: transfer.source?.bridge_wallet_id || wallet?.bridge_wallet_id || '',
          sourcePaymentRail: transfer.source?.payment_rail || 'bridge_wallet',
          destinationPaymentRail: transfer.destination?.payment_rail || '',
          destinationExternalAccountId: transfer.destination?.external_account_id,
          destinationWalletId: transfer.destination?.bridge_wallet_id,
          destinationCryptoAddress: transfer.destination?.to_address,
          receiptFinalAmount: transfer.receipt?.final_amount ? parseFloat(transfer.receipt.final_amount) : undefined,
          receiptTraceNumber: transfer.receipt?.trace_number,
          receiptImad: transfer.receipt?.imad,
          receiptDestinationTxHash: transfer.receipt?.destination_tx_hash,
          metadata: transfer,
          bridgeCreatedAt: transfer.created_at,
        })
        syncedCount++
      } catch (error: any) {
        console.error(`[SYNC-TX] Error syncing transfer ${transfer.id}:`, error.message)
        // Continue with next transfer
      }
    }
  } catch (error: any) {
    console.error(`[SYNC-TX] Error syncing transfer transactions:`, error.message)
    throw error
  }

  console.log(`[SYNC-TX] Synced ${syncedCount} transfer transactions`)
  return syncedCount
}

/**
 * Sync historical liquidation address drains (crypto deposits like USDC)
 */
export async function syncLiquidationDrainTransactions(
  userId: string,
  customerId: string,
  liquidationAddressId: string,
  sourceCurrency: string // 'usdc' or 'eurc'
): Promise<number> {
  let syncedCount = 0

  try {
    console.log(`[SYNC-TX] Syncing liquidation drain transactions for user ${userId}, address ${liquidationAddressId}`)
    
    // Fetch drain history from Bridge
    const drains = await bridgeLiquidationService.getDrainHistory(customerId, liquidationAddressId)
    
    console.log(`[SYNC-TX] Found ${drains.length} drains from Bridge API`)

    // Map source currency to display currency (USDC -> USD, EURC -> EUR)
    const displayCurrency = sourceCurrency.toLowerCase() === 'usdc' ? 'usd' : 
                           sourceCurrency.toLowerCase() === 'eurc' ? 'eur' : 
                           sourceCurrency.toLowerCase()

    for (const drain of drains) {
      try {
        console.log(`[SYNC-TX] Processing drain: ${drain.id}, amount: ${drain.amount}, state: ${drain.state}`)
        
        // Check if transaction already exists
        const existing = await bridgeTransactionService.getTransactionByBridgeId(drain.id)
        
        if (existing) {
          console.log(`[SYNC-TX] Drain ${drain.id} already exists in database, checking for status updates...`)
          // Update existing transaction if status changed
          if (existing.status !== drain.state) {
            console.log(`[SYNC-TX] Updating status from ${existing.status} to ${drain.state}`)
            await bridgeTransactionService.updateTransactionStatus(
              drain.id,
              drain.state,
              {
                receiptDestinationTxHash: drain.destination_tx_hash,
                completedAt: drain.state === 'payment_processed' ? drain.created_at : undefined,
                metadata: drain,
              }
            )
            syncedCount++
            console.log(`[SYNC-TX] ✅ Updated existing drain transaction`)
          } else {
            console.log(`[SYNC-TX] Drain ${drain.id} already exists with same status, skipping`)
          }
          continue
        }

        console.log(`[SYNC-TX] Creating new deposit transaction for drain ${drain.id}...`)
        // Create new deposit transaction for liquidation drain
        const transaction = await bridgeTransactionService.createDepositTransaction({
          userId,
          bridgeActivityId: drain.id,
          liquidationAddressId: liquidationAddressId,
          amount: parseFloat(drain.amount),
          currency: displayCurrency, // Show as USD/EUR, not USDC/EURC
          status: drain.state || 'funds_received',
          sourcePaymentRail: drain.destination?.payment_rail || 'solana', // Usually solana for USDC/EURC
          receiptDestinationTxHash: drain.destination_tx_hash,
          reference: drain.deposit_tx_hash, // Use deposit tx hash as reference
          metadata: {
            ...drain,
            source_currency: sourceCurrency,
            destination_currency: drain.destination?.currency,
          },
          bridgeCreatedAt: drain.created_at,
        })
        syncedCount++
        console.log(`[SYNC-TX] ✅ Created deposit transaction: ${transaction.transaction_id}`)
      } catch (error: any) {
        console.error(`[SYNC-TX] ❌ Error syncing drain ${drain.id}:`, error.message)
        console.error(`[SYNC-TX] Error stack:`, error.stack)
        // Continue with next drain
      }
    }
  } catch (error: any) {
    console.error(`[SYNC-TX] Error syncing liquidation drain transactions:`, error.message)
    throw error
  }

  console.log(`[SYNC-TX] Synced ${syncedCount} liquidation drain transactions`)
  return syncedCount
}

/**
 * Sync all transactions for a user (both deposits and sends)
 * Uses a lock to prevent concurrent syncs for the same user
 */
export async function syncAllTransactions(userId: string): Promise<{
  depositsSynced: number
  liquidationDrainsSynced: number
  transfersSynced: number
}> {
  // Check if sync is already in progress for this user
  const existingSync = syncLocks.get(userId)
  if (existingSync) {
    console.log(`[SYNC-TX] Sync already in progress for user ${userId}, waiting...`)
    await existingSync
    // Return zeros since we didn't do any work (another sync handled it)
    return {
      depositsSynced: 0,
      liquidationDrainsSynced: 0,
      transfersSynced: 0,
    }
  }

  // Create sync promise and lock
  const syncPromise = (async () => {
    try {
      const serverClient = createServerClient()
      
      // Get user's Bridge customer ID and virtual accounts
      const { data: userProfile } = await serverClient
        .from('users')
        .select('bridge_customer_id')
        .eq('id', userId)
        .single()

      if (!userProfile?.bridge_customer_id) {
        throw new Error('User does not have a Bridge customer ID')
      }

      const customerId = userProfile.bridge_customer_id

      // Get all virtual accounts for the user
      const { data: virtualAccounts } = await serverClient
        .from('bridge_virtual_accounts')
        .select('bridge_virtual_account_id, currency')
        .eq('user_id', userId)

      // Get liquidation addresses for the user
      const { data: wallet } = await serverClient
        .from('bridge_wallets')
        .select('usdc_liquidation_address_id, eurc_liquidation_address_id')
        .eq('user_id', userId)
        .single()

      console.log(`[SYNC-TX] Wallet liquidation addresses: USDC=${wallet?.usdc_liquidation_address_id || 'none'}, EURC=${wallet?.eurc_liquidation_address_id || 'none'}`)

      let depositsSynced = 0
      let liquidationDrainsSynced = 0
      let transfersSynced = 0

      // Sync deposits from all virtual accounts
      if (virtualAccounts && virtualAccounts.length > 0) {
        for (const account of virtualAccounts) {
          try {
            const count = await syncVirtualAccountTransactions(
              userId,
              customerId,
              account.bridge_virtual_account_id,
              account.currency
            )
            depositsSynced += count
          } catch (error: any) {
            console.error(`[SYNC-TX] Error syncing virtual account ${account.bridge_virtual_account_id}:`, error.message)
            // Continue with next account
          }
        }
      }

      // Sync liquidation address drains (USDC/EURC deposits)
      if (wallet) {
        if (wallet.usdc_liquidation_address_id) {
          try {
            console.log(`[SYNC-TX] Syncing USDC liquidation drains for address: ${wallet.usdc_liquidation_address_id}`)
            const count = await syncLiquidationDrainTransactions(
              userId,
              customerId,
              wallet.usdc_liquidation_address_id,
              'usdc'
            )
            liquidationDrainsSynced += count
            console.log(`[SYNC-TX] ✅ Synced ${count} USDC liquidation drain transactions`)
          } catch (error: any) {
            console.error(`[SYNC-TX] ❌ Error syncing USDC liquidation drains:`, error.message)
            console.error(`[SYNC-TX] Error details:`, error)
          }
        } else {
          console.log(`[SYNC-TX] ⚠️  No USDC liquidation address ID found in database. Run /api/bridge/sync-liquidation-addresses first.`)
        }
        
        if (wallet.eurc_liquidation_address_id) {
          try {
            console.log(`[SYNC-TX] Syncing EURC liquidation drains for address: ${wallet.eurc_liquidation_address_id}`)
            const count = await syncLiquidationDrainTransactions(
              userId,
              customerId,
              wallet.eurc_liquidation_address_id,
              'eurc'
            )
            liquidationDrainsSynced += count
            console.log(`[SYNC-TX] ✅ Synced ${count} EURC liquidation drain transactions`)
          } catch (error: any) {
            console.error(`[SYNC-TX] ❌ Error syncing EURC liquidation drains:`, error.message)
            console.error(`[SYNC-TX] Error details:`, error)
          }
        } else {
          console.log(`[SYNC-TX] ⚠️  No EURC liquidation address ID found in database. Run /api/bridge/sync-liquidation-addresses first.`)
        }
      } else {
        console.log(`[SYNC-TX] ⚠️  No wallet record found for user. Liquidation drains cannot be synced.`)
      }

      // Sync transfers
      try {
        transfersSynced = await syncTransferTransactions(userId, customerId)
      } catch (error: any) {
        console.error(`[SYNC-TX] Error syncing transfers:`, error.message)
      }

      return {
        depositsSynced,
        liquidationDrainsSynced,
        transfersSynced,
      }
    } finally {
      // Remove lock when sync completes (success or error)
      syncLocks.delete(userId)
    }
  })()

  // Store the sync promise as the lock
  syncLocks.set(userId, syncPromise)

  // Return the result
  return syncPromise
}

