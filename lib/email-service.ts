// Main email service using SendGrid API

import sgMail from '@sendgrid/mail'
import { emailTemplates } from './email-templates'
import type { 
  EmailData, 
  EmailServiceConfig, 
  SendGridResponse, 
  TransactionEmailData, 
  WelcomeEmailData 
} from './email-types'

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is required')
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export class EmailService {
  private config: EmailServiceConfig

  constructor(config?: Partial<EmailServiceConfig>) {
    this.config = {
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@easner.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'Easner',
      replyTo: process.env.SENDGRID_REPLY_TO || 'support@easner.com',
      ...config
    }
  }

  /**
   * Send a generic email using a template
   */
  async sendEmail(emailData: EmailData): Promise<SendGridResponse> {
    try {
      const template = emailTemplates[emailData.template]
      if (!template) {
        throw new Error(`Email template '${emailData.template}' not found`)
      }

      const msg = {
        to: emailData.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        replyTo: this.config.replyTo,
        subject: typeof template.subject === 'function' ? template.subject(emailData.data) : template.subject,
        html: template.html(emailData.data),
        text: template.text(emailData.data)
      }

      const response = await sgMail.send(msg)
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'] as string
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userData: WelcomeEmailData): Promise<SendGridResponse> {
    return this.sendEmail({
      to: userData.email,
      template: 'welcome',
      data: userData
    })
  }

  /**
   * Send transaction status notification
   */
  async sendTransactionNotification(
    userEmail: string, 
    transactionData: TransactionEmailData, 
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  ): Promise<SendGridResponse> {
    const templateMap = {
      pending: 'transactionPending',
      processing: 'transactionProcessing',
      completed: 'transactionCompleted',
      failed: 'transactionFailed',
      cancelled: 'transactionCancelled'
    }

    const templateName = templateMap[status]
    if (!templateName) {
      throw new Error(`Invalid transaction status: ${status}`)
    }

    return this.sendEmail({
      to: userEmail,
      template: templateName,
      data: {
        ...transactionData,
        status
      }
    })
  }

  /**
   * Send transaction pending email
   */
  async sendTransactionPendingEmail(userEmail: string, transactionData: TransactionEmailData): Promise<SendGridResponse> {
    return this.sendTransactionNotification(userEmail, transactionData, 'pending')
  }

  /**
   * Send transaction processing email
   */
  async sendTransactionProcessingEmail(userEmail: string, transactionData: TransactionEmailData): Promise<SendGridResponse> {
    return this.sendTransactionNotification(userEmail, transactionData, 'processing')
  }

  /**
   * Send transaction completed email
   */
  async sendTransactionCompletedEmail(userEmail: string, transactionData: TransactionEmailData): Promise<SendGridResponse> {
    return this.sendTransactionNotification(userEmail, transactionData, 'completed')
  }

  /**
   * Send transaction failed email
   */
  async sendTransactionFailedEmail(userEmail: string, transactionData: TransactionEmailData): Promise<SendGridResponse> {
    return this.sendTransactionNotification(userEmail, transactionData, 'failed')
  }

  /**
   * Send transaction cancelled email
   */
  async sendTransactionCancelledEmail(userEmail: string, transactionData: TransactionEmailData): Promise<SendGridResponse> {
    return this.sendTransactionNotification(userEmail, transactionData, 'cancelled')
  }

  /**
   * Test email sending (for development)
   */
  async sendTestEmail(to: string): Promise<SendGridResponse> {
    return this.sendEmail({
      to,
      template: 'welcome',
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: to,
        baseCurrency: 'USD',
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
      }
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export individual functions for convenience
export const {
  sendWelcomeEmail,
  sendTransactionNotification,
  sendTransactionPendingEmail,
  sendTransactionProcessingEmail,
  sendTransactionCompletedEmail,
  sendTransactionFailedEmail,
  sendTransactionCancelledEmail,
  sendTestEmail
} = emailService
