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
      } else if (status === 'processing') {
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

  /**
   * Send admin notification email for transaction events (with direct data)
   * This method accepts transaction, user, and recipient data directly
   * to avoid database queries that may fail due to timing issues
   */
  static async sendAdminTransactionNotification(
    transaction: any,
    user: { email: string; first_name?: string | null; last_name?: string | null },
    recipient: { full_name?: string | null } | null,
    status: string
  ): Promise<void>
  /**
   * Send admin notification email for transaction events (by transaction ID)
   * This method queries the database for transaction data
   */
  static async sendAdminTransactionNotification(
    transactionId: string,
    status: string
  ): Promise<void>
  static async sendAdminTransactionNotification(
    transactionOrId: any | string,
    userOrStatus?: { email: string; first_name?: string | null; last_name?: string | null } | string,
    recipientOrStatus?: { full_name?: string | null } | null | string,
    status?: string
  ): Promise<void> {
    // Check if called with direct data (transaction, user, recipient, status)
    // or with transaction ID (transactionId, status)
    const isDirectData = typeof transactionOrId === 'object' && userOrStatus && typeof userOrStatus === 'object'
    
    let transaction: any
    let user: { email: string; first_name?: string | null; last_name?: string | null }
    let recipient: { full_name?: string | null } | null
    let transactionStatus: string

    if (isDirectData) {
      // Called with direct data (transaction, user, recipient, status)
      transaction = transactionOrId
      user = userOrStatus as { email: string; first_name?: string | null; last_name?: string | null }
      recipient = recipientOrStatus as { full_name?: string | null } | null
      transactionStatus = status || 'pending'
      
      console.log('Sending admin notification for transaction (direct data):', transaction.transaction_id, 'status:', transactionStatus)
    } else {
      // Called with transaction ID (transactionId, status)
      const transactionId = transactionOrId as string
      transactionStatus = userOrStatus as string
      
      console.log('Sending admin notification for transaction (by ID):', transactionId, 'status:', transactionStatus)
      
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
        // Retry mechanism for database query (transaction might not be immediately available)
        let fetchedTransaction = null
        let transactionError = null
        const maxRetries = 3
        const retryDelay = 500 // 500ms delay between retries
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('transaction_id', transactionId.toUpperCase())
            .single()

          if (!error && data) {
            fetchedTransaction = data
            transactionError = null
            break
          } else {
            transactionError = error
            if (attempt < maxRetries) {
              console.log(`Transaction query attempt ${attempt} failed, retrying in ${retryDelay}ms...`)
              await new Promise(resolve => setTimeout(resolve, retryDelay))
            }
          }
        }

        if (transactionError) {
          console.error('Transaction query error after retries:', transactionError)
          throw new Error(`Transaction query failed: ${transactionError.message}`)
        }

        if (!fetchedTransaction) {
          console.error('Transaction not found for ID:', transactionId)
          throw new Error(`Transaction not found for ID: ${transactionId}`)
        }

        transaction = fetchedTransaction
        console.log('Transaction found:', transaction.transaction_id)

        // Get user data
        console.log('Fetching user data...')
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', transaction.user_id)
          .single()

        if (userError || !userData?.email) {
          console.error('User not found:', userError)
          throw new Error(`User not found or no email: ${userError?.message || 'No email address'}`)
        }

        user = userData
        console.log('User data found:', user.email)

        // Get recipient name
        console.log('Fetching recipient data...')
        const { data: recipientData, error: recipientError } = await supabase
          .from('recipients')
          .select('full_name')
          .eq('id', transaction.recipient_id)
          .single()

        recipient = recipientData
        console.log('Recipient found:', recipient?.full_name || 'Unknown')
      } catch (error) {
        console.error('Error fetching transaction data:', error)
        throw error
      }
    }

    try {
      // Create admin email data
      const adminEmailData = {
        transactionId: transaction.transaction_id,
        status: transactionStatus,
        sendAmount: transaction.send_amount,
        sendCurrency: transaction.send_currency,
        receiveAmount: transaction.receive_amount,
        receiveCurrency: transaction.receive_currency,
        exchangeRate: transaction.exchange_rate,
        fee: transaction.fee_amount,
        recipientName: recipient?.full_name || 'Unknown',
        userId: transaction.user_id,
        userEmail: user.email,
        userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
        failureReason: transaction.failure_reason
      }

      // Send admin notification email
      console.log('Sending admin notification email to: enyo@easner.com')
      console.log('Admin email data:', JSON.stringify(adminEmailData, null, 2))
      
      const result = await emailService.sendEmail({
        to: 'enyo@easner.com',
        template: 'adminTransactionNotification',
        data: adminEmailData
      })

      if (result.success) {
        console.log('Admin notification email sent successfully!', result.messageId)
      } else {
        console.error('Admin notification email sending failed:', result.error)
        throw new Error(`Failed to send admin email: ${result.error}`)
      }
    } catch (error) {
      console.error('Error sending admin notification email:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        transactionId: transaction?.transaction_id
      })
      // Re-throw to allow caller to handle
      throw error
    }
  }
}