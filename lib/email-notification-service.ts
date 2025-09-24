// Simple, working email notification service

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
   * Send transaction status email notification
   */
  static async sendTransactionStatusEmail(
    transactionId: string, 
    status: string
  ): Promise<void> {
    console.log('Sending email for transaction:', transactionId, 'status:', status)
    
    try {
      // Get transaction data from database
      const supabase = createServerClient()
      
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()

      if (transactionError || !transaction) {
        console.error('Transaction not found:', transactionError)
        return
      }

      // Get user email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', transaction.user_id)
        .single()

      if (userError || !user?.email) {
        console.error('User not found:', userError)
        return
      }

      // Get recipient name
      const { data: recipient, error: recipientError } = await supabase
        .from('recipients')
        .select('full_name')
        .eq('id', transaction.recipient_id)
        .single()

      // Create email data
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

      // Send email based on status
      console.log('Sending email to:', user.email)
      
      if (status === 'completed') {
        await emailService.sendTransactionCompletedEmail(user.email, emailData)
      } else if (status === 'processing' || status === 'initiated') {
        await emailService.sendTransactionProcessingEmail(user.email, emailData)
      } else if (status === 'pending') {
        await emailService.sendTransactionPendingEmail(user.email, emailData)
      } else if (status === 'failed') {
        await emailService.sendTransactionFailedEmail(user.email, emailData)
      } else if (status === 'cancelled') {
        await emailService.sendTransactionCancelledEmail(user.email, emailData)
      }

      console.log('Email sent successfully!')
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(
    userEmail: string, 
    firstName: string
  ): Promise<void> {
    try {
      await emailService.sendWelcomeEmail(userEmail, {
        firstName,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
      })
      console.log('Welcome email sent to:', userEmail)
    } catch (error) {
      console.error('Error sending welcome email:', error)
    }
  }
}