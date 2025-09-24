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
      
      // For now, let's use a simple approach - send a test email to verify the system works
      const testEmail = 'enyocreative@gmail.com' // Use your test email
      
      console.log('EmailNotificationService: Sending test email to:', testEmail)
      
      // Create mock email data for testing
      const emailData: TransactionEmailData = {
        transactionId: transactionId,
        recipientName: 'Test Recipient',
        sendAmount: 100,
        sendCurrency: 'USD',
        receiveAmount: 150000,
        receiveCurrency: 'NGN',
        exchangeRate: 1500,
        fee: 0,
        status: status as any,
        failureReason: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Send appropriate email based on status
      console.log('EmailNotificationService: Sending email for status:', status)
      switch (status) {
        case 'pending':
          console.log('EmailNotificationService: Sending pending email')
          await emailService.sendTransactionPendingEmail(testEmail, emailData)
          break
        case 'processing':
        case 'initiated':
          console.log('EmailNotificationService: Sending processing email')
          await emailService.sendTransactionProcessingEmail(testEmail, emailData)
          break
        case 'completed':
          console.log('EmailNotificationService: Sending completed email')
          await emailService.sendTransactionCompletedEmail(testEmail, emailData)
          break
        case 'failed':
          console.log('EmailNotificationService: Sending failed email')
          await emailService.sendTransactionFailedEmail(testEmail, emailData)
          break
        case 'cancelled':
          console.log('EmailNotificationService: Sending cancelled email')
          await emailService.sendTransactionCancelledEmail(testEmail, emailData)
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
