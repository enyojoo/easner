// Bridge Transaction Service
// Handles CRUD operations for unified bridge_transactions table (send + receive)

import { createServerClient } from "./supabase"
import { generateTransactionId } from "./transaction-id"

export interface BridgeTransaction {
  id: string
  transaction_id: string
  bridge_transaction_id?: string
  user_id: string
  transaction_type: 'send' | 'receive'
  direction: 'credit' | 'debit'
  amount: number
  currency: string
  final_amount?: number
  status: string // Bridge native status
  source_type?: string
  source_payment_rail?: string
  source_wallet_id?: string
  source_virtual_account_id?: string
  source_external_account_id?: string
  source_liquidation_address_id?: string
  destination_type?: string
  destination_payment_rail?: string
  destination_wallet_id?: string
  destination_external_account_id?: string
  destination_crypto_address?: string
  destination_virtual_account_id?: string
  name?: string
  recipient_id?: string
  deposit_id?: string
  transfer_id?: string
  activity_id?: string
  receipt_trace_number?: string
  receipt_imad?: string
  receipt_destination_tx_hash?: string
  receipt_final_amount?: number
  reference?: string
  metadata?: any
  created_at: string
  updated_at: string
  completed_at?: string
  bridge_created_at?: string
}

interface CreateDepositTransactionParams {
  userId: string
  bridgeActivityId: string
  virtualAccountId?: string // Optional for liquidation address deposits
  liquidationAddressId?: string // For liquidation address deposits
  amount: number
  currency: string
  status: string
  depositId?: string
  recipientName?: string
  sourcePaymentRail?: string
  receiptFinalAmount?: number
  receiptDestinationTxHash?: string
  reference?: string
  metadata?: any
  bridgeCreatedAt?: string
}

interface CreateSendTransactionParams {
  userId: string
  bridgeTransferId: string
  amount: number
  currency: string
  status: string
  sourceWalletId: string
  sourcePaymentRail: string
  destinationPaymentRail: string
  destinationExternalAccountId?: string
  destinationWalletId?: string
  destinationCryptoAddress?: string
  recipientName?: string
  recipientId?: string
  receiptFinalAmount?: number
  receiptTraceNumber?: string
  receiptImad?: string
  receiptDestinationTxHash?: string
  metadata?: any
  bridgeCreatedAt?: string
}

export const bridgeTransactionService = {
  /**
   * Create a deposit transaction (receive) from virtual account activity
   */
  async createDepositTransaction(params: CreateDepositTransactionParams): Promise<BridgeTransaction> {
    const serverClient = createServerClient()

    // Check if transaction already exists (idempotency)
    if (params.bridgeActivityId) {
      const existing = await this.getTransactionByBridgeId(params.bridgeActivityId)
      if (existing) {
        console.log(`[BRIDGE-TX] Deposit transaction already exists: ${existing.transaction_id}`)
        return existing
      }
    }

    // Generate transaction ID with retry logic for collision handling
    let transactionId = generateTransactionId()
    let attempts = 0
    const maxAttempts = 5

    // Determine source type based on whether it's a virtual account or liquidation address deposit
    const isLiquidationDeposit = params.liquidationAddressId && !params.virtualAccountId
    const sourceType = isLiquidationDeposit ? 'liquidation_address' : 'virtual_account'

    // Retry insert if transaction_id collision occurs
    while (attempts < maxAttempts) {
      const insertData: any = {
        transaction_id: transactionId,
      bridge_transaction_id: params.bridgeActivityId,
      user_id: params.userId,
      transaction_type: 'receive',
      direction: 'credit',
      amount: params.amount.toString(),
      currency: params.currency.toLowerCase(),
      status: params.status,
      source_type: sourceType,
      ...(params.virtualAccountId && { source_virtual_account_id: params.virtualAccountId }),
      ...(params.liquidationAddressId && { source_liquidation_address_id: params.liquidationAddressId }),
      destination_type: 'bridge_wallet',
      ...(params.depositId && { deposit_id: params.depositId }),
      activity_id: params.bridgeActivityId,
      ...(params.recipientName && { name: params.recipientName }),
      ...(params.sourcePaymentRail && { source_payment_rail: params.sourcePaymentRail }),
      ...(params.receiptFinalAmount && { receipt_final_amount: params.receiptFinalAmount.toString() }),
      ...(params.receiptDestinationTxHash && { receipt_destination_tx_hash: params.receiptDestinationTxHash }),
      ...(params.reference && { reference: params.reference }),
      ...(params.metadata && { metadata: params.metadata }),
      ...(params.bridgeCreatedAt && { bridge_created_at: params.bridgeCreatedAt }),
    }

      const { data, error } = await serverClient
        .from('bridge_transactions')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        // Handle unique constraint violation (transaction_id collision)
        if (error.code === '23505' && attempts < maxAttempts - 1) {
          attempts++
          // Add small random delay and regenerate ID
          await new Promise(resolve => setTimeout(resolve, 10))
          transactionId = generateTransactionId()
          continue
        }
        console.error('[BRIDGE-TX] Error creating deposit transaction:', error)
        throw new Error(`Failed to create deposit transaction: ${error.message}`)
      }

      return this.mapToTransaction(data)
    }

    throw new Error('Failed to create deposit transaction: Max retry attempts reached')
  },

  /**
   * Create a send transaction from transfer
   */
  async createSendTransaction(params: CreateSendTransactionParams): Promise<BridgeTransaction> {
    const serverClient = createServerClient()

    // Check if transaction already exists (idempotency)
    if (params.bridgeTransferId) {
      const existing = await this.getTransactionByBridgeId(params.bridgeTransferId)
      if (existing) {
        console.log(`[BRIDGE-TX] Send transaction already exists: ${existing.transaction_id}`)
        return existing
      }
    }

    // Generate transaction ID with retry logic for collision handling
    let transactionId = generateTransactionId()
    let attempts = 0
    const maxAttempts = 5

    // Retry insert if transaction_id collision occurs
    while (attempts < maxAttempts) {
      const insertData: any = {
        transaction_id: transactionId,
      bridge_transaction_id: params.bridgeTransferId,
      user_id: params.userId,
      transaction_type: 'send',
      direction: 'debit',
      amount: params.amount.toString(),
      currency: params.currency.toLowerCase(),
      status: params.status,
      source_type: 'bridge_wallet',
      source_payment_rail: params.sourcePaymentRail,
      source_wallet_id: params.sourceWalletId,
      destination_payment_rail: params.destinationPaymentRail,
      ...(params.destinationExternalAccountId && {
        destination_type: 'external_account',
        destination_external_account_id: params.destinationExternalAccountId,
      }),
      ...(params.destinationWalletId && {
        destination_type: 'bridge_wallet',
        destination_wallet_id: params.destinationWalletId,
      }),
      ...(params.destinationCryptoAddress && {
        destination_type: 'crypto_address',
        destination_crypto_address: params.destinationCryptoAddress,
      }),
      ...(params.transfer_id && { transfer_id: params.bridgeTransferId }),
      ...(params.recipientName && { name: params.recipientName }),
      ...(params.recipientId && { recipient_id: params.recipientId }),
      ...(params.receiptFinalAmount && { receipt_final_amount: params.receiptFinalAmount.toString() }),
      ...(params.receiptTraceNumber && { receipt_trace_number: params.receiptTraceNumber }),
      ...(params.receiptImad && { receipt_imad: params.receiptImad }),
      ...(params.receiptDestinationTxHash && { receipt_destination_tx_hash: params.receiptDestinationTxHash }),
      ...(params.metadata && { metadata: params.metadata }),
      ...(params.bridgeCreatedAt && { bridge_created_at: params.bridgeCreatedAt }),
    }

      const { data, error } = await serverClient
        .from('bridge_transactions')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        // Handle unique constraint violation (transaction_id collision)
        if (error.code === '23505' && attempts < maxAttempts - 1) {
          attempts++
          // Add small random delay and regenerate ID
          await new Promise(resolve => setTimeout(resolve, 10))
          transactionId = generateTransactionId()
          continue
        }
        console.error('[BRIDGE-TX] Error creating send transaction:', error)
        throw new Error(`Failed to create send transaction: ${error.message}`)
      }

      return this.mapToTransaction(data)
    }

    throw new Error('Failed to create send transaction: Max retry attempts reached')
  },

  /**
   * Update transaction status
   * @param identifier - Can be bridge_transaction_id, transaction_id, or internal id
   * @param status - New status
   * @param updates - Additional fields to update
   * @param activityId - Optional: latest activity.id to update activity_id and bridge_transaction_id
   */
  async updateTransactionStatus(
    identifier: string,
    status: string,
    updates?: {
      receiptFinalAmount?: number
      receiptTraceNumber?: string
      receiptImad?: string
      receiptDestinationTxHash?: string
      completedAt?: string
      metadata?: any
      activityId?: string // Latest activity.id - updates both activity_id and bridge_transaction_id
    },
  ): Promise<BridgeTransaction> {
    const serverClient = createServerClient()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      ...(updates?.receiptFinalAmount && { receipt_final_amount: updates.receiptFinalAmount.toString() }),
      ...(updates?.receiptTraceNumber && { receipt_trace_number: updates.receiptTraceNumber }),
      ...(updates?.receiptImad && { receipt_imad: updates.receiptImad }),
      ...(updates?.receiptDestinationTxHash && { receipt_destination_tx_hash: updates.receiptDestinationTxHash }),
      ...(updates?.completedAt && { completed_at: updates.completedAt }),
      ...(updates?.metadata && { metadata: updates.metadata }),
      // Update activity_id and bridge_transaction_id to latest activity.id when status changes
      ...(updates?.activityId && {
        activity_id: updates.activityId,
        bridge_transaction_id: updates.activityId, // Update to latest activity.id
      }),
    }

    // If status is completed, set completed_at if not already set
    if ((status === 'payment_processed' || status === 'completed') && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }

    // Try to find by bridge_transaction_id first (for backward compatibility)
    // Then try by transaction_id, then by id
    let query = serverClient
      .from('bridge_transactions')
      .update(updateData)
      .eq('bridge_transaction_id', identifier)

    const { data, error } = await query.select().single()

    if (error || !data) {
      // Fallback: try by transaction_id
      const { data: data2, error: error2 } = await serverClient
        .from('bridge_transactions')
        .update(updateData)
        .eq('transaction_id', identifier)
        .select()
        .single()

      if (error2 || !data2) {
        // Final fallback: try by id (UUID)
        const { data: data3, error: error3 } = await serverClient
          .from('bridge_transactions')
          .update(updateData)
          .eq('id', identifier)
          .select()
          .single()

        if (error3) {
          console.error('[BRIDGE-TX] Error updating transaction status:', error3)
          throw new Error(`Failed to update transaction status: ${error3.message}`)
        }
        return this.mapToTransaction(data3)
      }
      return this.mapToTransaction(data2)
    }

    return this.mapToTransaction(data)
  },

  /**
   * Get transaction by internal transaction_id
   */
  async getTransactionById(transactionId: string): Promise<BridgeTransaction | null> {
    const serverClient = createServerClient()

    const { data, error } = await serverClient
      .from('bridge_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to get transaction: ${error.message}`)
    }

    return data ? this.mapToTransaction(data) : null
  },

  /**
   * Get transaction by Bridge transaction ID (transfer_id or activity_id)
   */
  async getTransactionByBridgeId(bridgeTransactionId: string): Promise<BridgeTransaction | null> {
    const serverClient = createServerClient()

    const { data, error } = await serverClient
      .from('bridge_transactions')
      .select('*')
      .eq('bridge_transaction_id', bridgeTransactionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to get transaction: ${error.message}`)
    }

    return data ? this.mapToTransaction(data) : null
  },

  /**
   * Get transactions for a user
   */
  async getTransactionsByUser(
    userId: string,
    filters?: {
      type?: 'send' | 'receive'
      status?: string
      currency?: string
      limit?: number
      offset?: number
    },
  ): Promise<BridgeTransaction[]> {
    const serverClient = createServerClient()

    let query = serverClient
      .from('bridge_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('transaction_type', filters.type)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.currency) {
      query = query.eq('currency', filters.currency.toLowerCase())
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get transactions: ${error.message}`)
    }

    return (data || []).map((tx) => this.mapToTransaction(tx))
  },

  /**
   * Map database row to BridgeTransaction interface
   */
  mapToTransaction(row: any): BridgeTransaction {
    return {
      id: row.id,
      transaction_id: row.transaction_id,
      bridge_transaction_id: row.bridge_transaction_id,
      user_id: row.user_id,
      transaction_type: row.transaction_type,
      direction: row.direction,
      amount: parseFloat(row.amount),
      currency: row.currency,
      final_amount: row.final_amount ? parseFloat(row.final_amount) : undefined,
      status: row.status,
      source_type: row.source_type,
      source_payment_rail: row.source_payment_rail,
      source_wallet_id: row.source_wallet_id,
      source_virtual_account_id: row.source_virtual_account_id,
      source_external_account_id: row.source_external_account_id,
      source_liquidation_address_id: row.source_liquidation_address_id,
      destination_type: row.destination_type,
      destination_payment_rail: row.destination_payment_rail,
      destination_wallet_id: row.destination_wallet_id,
      destination_external_account_id: row.destination_external_account_id,
      destination_crypto_address: row.destination_crypto_address,
      destination_virtual_account_id: row.destination_virtual_account_id,
      name: row.name,
      recipient_id: row.recipient_id,
      deposit_id: row.deposit_id,
      transfer_id: row.transfer_id,
      activity_id: row.activity_id,
      receipt_trace_number: row.receipt_trace_number,
      receipt_imad: row.receipt_imad,
      receipt_destination_tx_hash: row.receipt_destination_tx_hash,
      receipt_final_amount: row.receipt_final_amount ? parseFloat(row.receipt_final_amount) : undefined,
      reference: row.reference,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at,
      bridge_created_at: row.bridge_created_at,
    }
  },
}

