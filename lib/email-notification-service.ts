// Simple, non-blocking email notification service
// This service sends emails in the background without interfering with core functionality

import { createServerClient } from './supabase'
import { emailService } from './email-service'

export interface TransactionEmailData {
  transactionId: string
  recipientName: string
  sendAmount: number
  sendCurrency: string
  receiveAmount: number
  receiveCurrency: string
  exchangeRate: number
  fee: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export class EmailNotificationService {
  /**
   * Send transaction status email notification (non-blocking)
   * This method runs in the background and doesn't affect the main transaction flow
   */
  static async sendTransactionStatusEmail(
    transactionId: string, 
    status: string
  ): Promise<void> {
    console.log('EmailNotificationService: sendTransactionStatusEmail called for:', transactionId, status)
    // Run in background - don't await this
    this.sendEmailInBackground(transactionId, status).catch(error => {
      console.error('Background email notification failed:', error)
      // Don't throw - this is non-blocking
    })
  }

  /**
   * Send welcome email (non-blocking)
   */
  static async sendWelcomeEmail(
    userEmail: string, 
    firstName: string
  ): Promise<void> {
    // Run in background - don't await this
    this.sendWelcomeInBackground(userEmail, firstName).catch(error => {
      console.error('Background welcome email failed:', error)
      // Don't throw - this is non-blocking
    })
  }

  /**
   * Background method to send transaction status email
   */
  private static async sendEmailInBackground(
    transactionId: string, 
    status: string
  ): Promise<void> {
    try {
      console.log('EmailNotificationService: sendEmailInBackground called for:', transactionId, status)
      
      // Get transaction details with proper error handling
      const supabase = createServerClient()
      
      // First, get the basic transaction data
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()

      if (transactionError || !transaction) {
        console.error('Failed to fetch transaction:', transactionError)
        return
      }

      console.log('EmailNotificationService: Transaction found:', transaction.transaction_id)

      // Get user data separately
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', transaction.user_id)
        .single()

      if (userError || !user?.email) {
        console.error('Failed to fetch user data:', userError)
        console.log('EmailNotificationService: User ID from transaction:', transaction.user_id)
        return
      }

      console.log('EmailNotificationService: User found:', user.email)

      // Get recipient data separately
      const { data: recipient, error: recipientError } = await supabase
        .from('recipients')
        .select('full_name')
        .eq('id', transaction.recipient_id)
        .single()

      console.log('EmailNotificationService: Recipient found:', recipient?.full_name || 'Unknown')

      // Prepare email data
      const emailData: TransactionEmailData = {
        transactionId: transaction.transaction_id,
        recipientName: recipient?.full_name || 'Unknown',
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

      // Send appropriate email based on status
      console.log('EmailNotificationService: Sending email for status:', status)
      switch (status) {
        case 'pending':
          await emailService.sendTransactionPendingEmail(user.email, emailData)
          break
        case 'processing':
        case 'initiated':
          await emailService.sendTransactionProcessingEmail(user.email, emailData)
          break
        case 'completed':
          await emailService.sendTransactionCompletedEmail(user.email, emailData)
          break
        case 'failed':
          await emailService.sendTransactionFailedEmail(user.email, emailData)
          break
        case 'cancelled':
          await emailService.sendTransactionCancelledEmail(user.email, emailData)
          break
        default:
          console.log(`Unknown transaction status: ${status}`)
      }

      console.log(`Email notification sent for transaction ${transactionId} with status ${status}`)
    } catch (error) {
      console.error('Error sending transaction status email:', error)
      // Don't throw - this is non-blocking
    }
  }

  /**
   * Background method to send welcome email
   */
  private static async sendWelcomeInBackground(
    userEmail: string, 
    firstName: string
  ): Promise<void> {
    try {
      await emailService.sendWelcomeEmail(userEmail, {
        firstName,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
      })
      console.log(`Welcome email sent to ${userEmail}`)
    } catch (error) {
      console.error('Error sending welcome email:', error)
      // Don't throw - this is non-blocking
    }
  }
}
