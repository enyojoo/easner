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
      console.log('Creating Supabase client...')
      let supabase
      try {
        supabase = createServerClient()
        console.log('Supabase client created successfully')
      } catch (clientError) {
        console.error('Failed to create Supabase client:', clientError)
        return
      }
      
      console.log('Fetching transaction data...')
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()

      if (transactionError) {
        console.error('Transaction query error:', transactionError)
        throw new Error(`Transaction query failed: ${transactionError.message}`)
      }

      if (!transaction) {
        console.error('Transaction not found for ID:', transactionId)
        throw new Error(`Transaction not found for ID: ${transactionId}`)
      }

      console.log('Transaction found:', transaction.transaction_id)

      // Get user email
      console.log('Fetching user data...')
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', transaction.user_id)
        .single()

      if (userError || !user?.email) {
        console.error('User not found:', userError)
        throw new Error(`User not found or no email: ${userError?.message || 'No email address'}`)
      }

      console.log('User email found:', user.email)

      // Get recipient name
      console.log('Fetching recipient data...')
      const { data: recipient, error: recipientError } = await supabase
        .from('recipients')
        .select('full_name')
        .eq('id', transaction.recipient_id)
        .single()

      console.log('Recipient found:', recipient?.full_name || 'Unknown')

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
      console.log('Sending email to:', user.email, 'with status:', status)
      
      let result
      if (status === 'completed') {
        result = await emailService.sendTransactionCompletedEmail(user.email, emailData)
      } else if (status === 'processing' || status === 'initiated') {
        result = await emailService.sendTransactionProcessingEmail(user.email, emailData)
      } else if (status === 'pending') {
        result = await emailService.sendTransactionPendingEmail(user.email, emailData)
      } else if (status === 'failed') {
        result = await emailService.sendTransactionFailedEmail(user.email, emailData)
      } else if (status === 'cancelled') {
        result = await emailService.sendTransactionCancelledEmail(user.email, emailData)
      } else {
        console.log('Unknown status:', status)
        return
      }

      if (result.success) {
        console.log('Email sent successfully!', result.messageId)
      } else {
        console.error('Email sending failed:', result.error)
      }
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
      const result = await emailService.sendWelcomeEmail({
        firstName,
        lastName: '',
        email: userEmail,
        baseCurrency: 'USD',
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
      })
      
      if (result.success) {
        console.log('Welcome email sent to:', userEmail)
      } else {
        console.error('Welcome email failed:', result.error)
      }
    } catch (error) {
      console.error('Error sending welcome email:', error)
    }
  }
}