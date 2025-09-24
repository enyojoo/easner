// Transaction status management service with email notifications

import { createServerClient } from './supabase'
import type { Transaction, TransactionStatusHistory } from '@/types'

export interface StatusUpdateData {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  failure_reason?: string
  reference?: string
  completed_at?: string
}

export interface StatusUpdateResult {
  success: boolean
  transaction?: Transaction
  error?: string
}

export class TransactionStatusService {
  /**
   * Update transaction status with email notifications
   */
  async updateStatus(
    transactionId: string, 
    statusData: StatusUpdateData
  ): Promise<StatusUpdateResult> {
    try {
      // Get current transaction with user and recipient data
      const { data: currentTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          recipient:recipients(*),
          user:users(first_name, last_name, email)
        `)
        .eq('transaction_id', transactionId)
        .single()

      if (fetchError || !currentTransaction) {
        return {
          success: false,
          error: 'Transaction not found'
        }
      }

      const previousStatus = currentTransaction.status

      // Validate status transition
      if (!this.isValidStatusTransition(previousStatus, statusData.status)) {
        return {
          success: false,
          error: `Invalid status transition from ${previousStatus} to ${statusData.status}`
        }
      }

      // Update transaction
      const updateData: any = {
        status: statusData.status,
        updated_at: new Date().toISOString()
      }

      // Only add optional fields if they exist in the schema
      if (statusData.failure_reason) {
        updateData.failure_reason = statusData.failure_reason
      }

      if (statusData.reference) {
        updateData.reference = statusData.reference
      }

      if (statusData.completed_at) {
        updateData.completed_at = statusData.completed_at
      }

      const { data: updatedTransaction, error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('transaction_id', transactionId)
        .select(`
          *,
          recipient:recipients(*),
          user:users(first_name, last_name, email)
        `)
        .single()

      if (updateError) {
        return {
          success: false,
          error: `Failed to update transaction: ${updateError.message}`
        }
      }

      // Create status history record
      await this.createStatusHistory(transactionId, statusData, previousStatus)

      // Send email notification (non-blocking)
      this.sendStatusNotification(updatedTransaction, statusData.status).catch(error => {
        console.error('Email notification failed:', error)
        // Don't throw error as email failure shouldn't break status update
      })

      return {
        success: true,
        transaction: updatedTransaction
      }
    } catch (error) {
      console.error('Error updating transaction status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get transaction status history
   */
  async getStatusHistory(transactionId: string): Promise<TransactionStatusHistory[]> {
    const { data, error } = await supabase
      .from('transaction_status_history')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch status history: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create status history record
   */
  private async createStatusHistory(
    transactionId: string, 
    statusData: StatusUpdateData, 
    previousStatus: string
  ): Promise<void> {
    try {
      const supabase = createServerClient()
      const { error } = await supabase
        .from('transaction_status_history')
        .insert({
          transaction_id: transactionId,
          status: statusData.status,
          previous_status: previousStatus,
          failure_reason: statusData.failure_reason,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to create status history:', error)
        // Don't throw error as this is not critical
      }
    } catch (error) {
      console.error('Status history table may not exist:', error)
      // Don't throw error as this is not critical
    }
  }

  /**
   * Send email notification based on status
   */
  async sendStatusNotification(
    transaction: Transaction, 
    status: string
  ): Promise<void> {
    if (!transaction.user?.email) {
      console.warn('No user email found for transaction notification')
      return
    }

    // Only send emails on server side
    if (typeof window !== 'undefined') {
      return
    }

    const emailData = {
      transactionId: transaction.transaction_id,
      recipientName: transaction.recipient?.full_name || 'Unknown',
      sendAmount: transaction.send_amount,
      sendCurrency: transaction.send_currency,
      receiveAmount: transaction.receive_amount,
      receiveCurrency: transaction.receive_currency,
      exchangeRate: transaction.exchange_rate,
      fee: transaction.fee_amount,
      status: status as any,
      failureReason: transaction.failure_reason,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at
    }

    try {
      // Dynamically import email service only on server side
      const { emailService } = await import('./email-service')
      
      switch (status) {
        case 'pending':
          await emailService.sendTransactionPendingEmail(transaction.user.email, emailData)
          break
        case 'processing':
          await emailService.sendTransactionProcessingEmail(transaction.user.email, emailData)
          break
        case 'completed':
          await emailService.sendTransactionCompletedEmail(transaction.user.email, emailData)
          break
        case 'failed':
          await emailService.sendTransactionFailedEmail(transaction.user.email, emailData)
          break
        case 'cancelled':
          await emailService.sendTransactionCancelledEmail(transaction.user.email, emailData)
          break
        default:
          console.warn(`Unknown transaction status: ${status}`)
      }
    } catch (error) {
      console.error('Failed to send status notification email:', error)
      // Don't throw error as email failure shouldn't break the status update
    }
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(
    currentStatus: string, 
    newStatus: string
  ): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled', 'failed'],
      'processing': ['completed', 'failed', 'cancelled'],
      'completed': [], // Terminal state
      'failed': ['pending'], // Can retry
      'cancelled': [] // Terminal state
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  /**
   * Get transaction by ID with full details
   */
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
      .eq('transaction_id', transactionId)
      .single()

    if (error) {
      console.error('Error fetching transaction:', error)
      return null
    }

    return data
  }

  /**
   * Auto-process pending transactions (for demo/testing)
   */
  async autoProcessPendingTransactions(): Promise<void> {
    const { data: pendingTransactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 2 * 60 * 1000).toISOString()) // 2 minutes ago

    if (error) {
      console.error('Error fetching pending transactions:', error)
      return
    }

    for (const transaction of pendingTransactions || []) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Move to processing
      await this.updateStatus(transaction.transaction_id, {
        status: 'processing'
      })

      // Simulate completion after 30 seconds
      setTimeout(async () => {
        await this.updateStatus(transaction.transaction_id, {
          status: 'completed',
          completed_at: new Date().toISOString()
        })
      }, 30000) // 30 seconds
    }
  }
}

// Export singleton instance
export const transactionStatusService = new TransactionStatusService()
