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
      
      // Get transaction details
      console.log('EmailNotificationService: Creating Supabase client')
      const supabase = createServerClient()
      
      console.log('EmailNotificationService: Fetching transaction details')
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select(`
          *,
          recipient:recipients(*),
          user:users(first_name, last_name, email)
        `)
        .eq('transaction_id', transactionId)
        .single()

      if (error || !transaction) {
        console.error('Failed to fetch transaction for email:', error)
        return
      }

      console.log('EmailNotificationService: Transaction found:', transaction.transaction_id)
      console.log('EmailNotificationService: Full transaction data:', JSON.stringify(transaction, null, 2))
      console.log('EmailNotificationService: User data:', transaction.user)
      console.log('EmailNotificationService: Recipient data:', transaction.recipient)

      if (!transaction.user?.email) {
        console.log('No user email found for transaction notification')
        console.log('EmailNotificationService: Available user fields:', Object.keys(transaction.user || {}))
        return
      }

      // Prepare email data
      const emailData: TransactionEmailData = {
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

      // Send appropriate email based on status
      console.log('EmailNotificationService: Sending email for status:', status)
      switch (status) {
        case 'pending':
          console.log('EmailNotificationService: Sending pending email')
          await emailService.sendTransactionPendingEmail(transaction.user.email, emailData)
          break
        case 'processing':
          console.log('EmailNotificationService: Sending processing email')
          await emailService.sendTransactionProcessingEmail(transaction.user.email, emailData)
          break
        case 'completed':
          console.log('EmailNotificationService: Sending completed email')
          await emailService.sendTransactionCompletedEmail(transaction.user.email, emailData)
          break
        case 'failed':
          console.log('EmailNotificationService: Sending failed email')
          await emailService.sendTransactionFailedEmail(transaction.user.email, emailData)
          break
        case 'cancelled':
          console.log('EmailNotificationService: Sending cancelled email')
          await emailService.sendTransactionCancelledEmail(transaction.user.email, emailData)
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
