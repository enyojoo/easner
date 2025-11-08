// Email templates for all notification types

import { generateBaseEmailTemplate, generateTransactionDetails } from './email-generator'
import type { EmailTemplate, TransactionEmailData, WelcomeEmailData } from './email-types'

export const emailTemplates: Record<string, EmailTemplate> = {
  // Welcome Email
  welcome: {
    subject: "Welcome to Easner! Let's get started",
    html: (data: WelcomeEmailData) => {
      const content = `
        <p class="welcome-text">
          Hi ${data.firstName}! Welcome to Easner.
        </p>
        
        <p class="confirmation-text">
          Thank you for joining Easner! We're excited to have you as part of our community. 
          Your account is now active and ready to send money across borders in under 5 minutes.
        </p>
        
        <p class="confirmation-text">
          With Easner, you can:
        </p>
        
        <ul style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 20px 0; padding-left: 20px;">
          <li><strong>Send money globally in under 5 minutes</strong> - Lightning-fast cross-border transfers</li>
          <li>Track your transfers in real-time with live updates</li>
          <li>Save your favorite recipients for instant transfers</li>
          <li>Enjoy competitive exchange rates with zero hidden fees</li>
        </ul>
        
        <div class="security-note">
          <h3>Getting Started</h3>
          <p>To send your first transfer, simply click the "Send Money" button in your dashboard and follow the easy steps. Your money will reach its destination in under 5 minutes!</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Welcome to Easner!",
        "",
        content,
        {
          text: "Go to Dashboard",
          url: data.dashboardUrl
        }
      )
    },
    text: (data: WelcomeEmailData) => `
Welcome to Easner!

Hi ${data.firstName}!

Thank you for joining Easner! We're excited to have you as part of our community. Your account is now active and ready to send money across borders in under 5 minutes.

With Easner, you can:
• Send money globally in under 5 minutes - Lightning-fast cross-border transfers
• Track your transfers in real-time with live updates
• Save your favorite recipients for instant transfers
• Enjoy competitive exchange rates with zero hidden fees

Getting Started:
To send your first transfer, simply go to your dashboard and click "Send Money". Your money will reach its destination in under 5 minutes!

Go to Dashboard: ${data.dashboardUrl}

Need help? Contact us at support@easner.com

© 2025 Easner, Inc. All rights reserved.
    `
  },

  // Transaction Pending
  transactionPending: {
    subject: (data: TransactionEmailData) => `Transaction Created - #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Your transfer to ${data.recipientName} has been created and is now being processed. 
          We'll send you updates as your money makes its way to its destination!
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What's Next</h3>
          <p>We're working on your transfer and will notify you as soon as it's completed. You can track the progress in your dashboard.</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transaction Created",
        "",
        content,
        {
          text: "Track Transaction",
          url: `https://www.easner.com/user/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transaction Created - #${data.transactionId}

Your transfer to ${data.recipientName} has been created and is now being processed. We'll send you updates as your money makes its way to its destination!

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}
- Status: ${data.status}

What's Next:
We're working on your transfer and will notify you as soon as it's completed. You can track the progress in your dashboard.

Track Transaction: https://www.easner.com/user/send/${data.transactionId.toLowerCase()}

Need help? Contact us at support@easner.com
    `
  },

  // Transaction Processing
  transactionProcessing: {
    subject: (data: TransactionEmailData) => `Transfer Processing - Transaction #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Great news! We've received your payment and your transfer to ${data.recipientName} is now being processed. 
          Your money will arrive in under 5 minutes!
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What's Happening</h3>
          <p>We're working with our banking partners to complete your transfer. Thanks to our advanced technology, this typically takes under 5 minutes!</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Processing",
        "",
        content,
        {
          text: "Track Transfer",
          url: `https://www.easner.com/user/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Processing - Transaction #${data.transactionId}

Great news! We've received your payment and your transfer to ${data.recipientName} is now being processed. Your money will arrive in under 5 minutes!

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}
- Status: ${data.status}

What's Happening:
We're working with our banking partners to complete your transfer. Thanks to our advanced technology, this typically takes under 5 minutes!

Track Transfer: https://www.easner.com/user/send/${data.transactionId.toLowerCase()}

Need help? Contact us at support@easner.com
    `
  },

  // Transaction Completed
  transactionCompleted: {
    subject: (data: TransactionEmailData) => `Transfer Completed Successfully! 🎉 Transaction #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Your transfer to ${data.recipientName} has been completed successfully! 
          The money has been sent and should arrive within minutes.
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What's Next</h3>
          <p>Your recipient should receive the money within minutes thanks to our fast processing. You can track all your transfers in your dashboard.</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Completed!",
        "",
        content,
        {
          text: "View Transaction",
          url: `https://www.easner.com/user/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Completed - Transaction #${data.transactionId}

Your transfer to ${data.recipientName} has been completed successfully! The money has been sent and should arrive within minutes.

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}
- Status: ${data.status}

What's Next:
Your recipient should receive the money within minutes thanks to our fast processing. You can track all your transfers in your dashboard.

View Transaction: https://www.easner.com/user/send/${data.transactionId.toLowerCase()}

Need help? Contact us at support@easner.com
    `
  },

  // Transaction Failed
  transactionFailed: {
    subject: (data: TransactionEmailData) => `Transaction Failed - #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Unfortunately, your transfer to ${data.recipientName} could not be completed. 
          ${data.failureReason ? `Reason: ${data.failureReason}` : 'Please contact support for more information.'}
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What Happens Next</h3>
          <p>If you were charged for this transfer, we will automatically refund the amount to your original payment method within 3-5 business days.</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Failed",
        "",
        content,
        {
          text: "Contact Support",
          url: `https://www.easner.com/user/support`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Failed - Transaction #${data.transactionId}

Unfortunately, your transfer to ${data.recipientName} could not be completed. 
${data.failureReason ? `Reason: ${data.failureReason}` : 'Please contact support for more information.'}

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}
- Status: ${data.status}

What Happens Next:
If you were charged for this transfer, we will automatically refund the amount to your original payment method within 3-5 business days.

Contact Support: https://www.easner.com/user/support

Need help? Contact us at support@easner.com
    `
  },

  // Transaction Cancelled
  transactionCancelled: {
    subject: (data: TransactionEmailData) => `Transaction Cancelled - #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Your transfer to ${data.recipientName} has been cancelled. 
          ${data.failureReason ? `Reason: ${data.failureReason}` : 'This may have been cancelled by you or our support team.'}
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>Refund Information</h3>
          <p>If you were charged for this transfer, we will automatically refund the amount to your original payment method within 3-5 business days.</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Cancelled",
        "",
        content,
        {
          text: "Send New Transfer",
          url: `https://www.easner.com/user/send`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Cancelled - Transaction #${data.transactionId}

Your transfer to ${data.recipientName} has been cancelled. 
${data.failureReason ? `Reason: ${data.failureReason}` : 'This may have been cancelled by you or our support team.'}

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}
- Status: ${data.status}

Refund Information:
If you were charged for this transfer, we will automatically refund the amount to your original payment method within 3-5 business days.

Send New Transfer: https://www.easner.com/user/send

Need help? Contact us at support@easner.com
    `
  },

  // Early Access Request
  earlyAccessRequest: {
    subject: "New Early Access Request - Easner",
    html: (data: any) => {
      const content = `
        <p class="welcome-text">
          New Early Access Request
        </p>
        
        <p class="confirmation-text">
          A new user has requested early access to Easner. Here are their details:
        </p>
        
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #007ACC; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h3>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Name:</strong> ${data.fullName}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>WhatsApp/Telegram:</strong> ${data.whatsappTelegram}</p>
        </div>
        
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #007ACC; margin: 0 0 15px 0; font-size: 18px;">Use Case & Transfer Preferences</h3>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Primary Use Case:</strong> ${data.primaryUseCase}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Located in:</strong> ${data.locatedIn}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Sending to:</strong> ${data.sendingTo}</p>
        </div>
        
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #007ACC; margin: 0 0 15px 0; font-size: 18px;">Request Details</h3>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Submitted at:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>User Agent:</strong> ${data.userAgent}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>IP Address:</strong> ${data.ipAddress}</p>
        </div>
        
            `

            return generateBaseEmailTemplate(
              "New Early Access Request",
              "",
              content
            )
    },
    text: (data: any) => `
New Early Access Request - Easner

A new user has requested early access to Easner. Here are their details:

Contact Information:
- Name: ${data.fullName}
- Email: ${data.email}
- WhatsApp/Telegram: ${data.whatsappTelegram}

Use Case & Transfer Preferences:
- Primary Use Case: ${data.primaryUseCase}
- Located in: ${data.locatedIn}
- Sending to: ${data.sendingTo}

Request Details:
- Submitted at: ${new Date(data.submittedAt).toLocaleString()}
- User Agent: ${data.userAgent}
- IP Address: ${data.ipAddress}

        © 2025 Easner, Inc. All rights reserved.
    `
  },

  // Early Access Confirmation (sent to user)
  earlyAccessConfirmation: {
    subject: "You're on the list! - Easner Early Access",
    html: (data: any) => {
      const content = `
        <p class="welcome-text">
          You're on the list! 🎉
        </p>

        <p class="confirmation-text">
          Thank you for requesting early access to Easner! We're excited to have you join our community of users who will experience zero-fee international money transfers.
        </p>

        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #007ACC; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 16px;">
            <li style="margin-bottom: 8px; font-size: 16px;">We'll review your application and use case</li>
            <li style="margin-bottom: 8px; font-size: 16px;">You'll receive an invitation email when approved</li>
            <li style="margin-bottom: 8px; font-size: 16px;">We'll follow up with you via the contact method you provided</li>
            <li style="margin-bottom: 0; font-size: 16px;">You'll be among the first to experience our platform</li>
          </ul>
        </div>

        <div style="background: #e8f4fd; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #007ACC; margin: 0 0 10px 0; font-size: 18px;">Why Easner?</h3>
          <p style="margin: 0; color: #555; font-size: 16px;">
            We're building the future of international money transfers with zero fees, real-time exchange rates, and instant transfers. Your early access will help us shape the perfect experience for users like you.
          </p>
        </div>

        <div class="security-note">
          <h3>Questions?</h3>
          <p>If you have any questions about your early access request or our platform, feel free to reach out to us. We're here to help!</p>
        </div>
      `

      return generateBaseEmailTemplate(
        "You're on the list!",
        `Hi ${data.fullName},`,
        content
      )
    },
    text: (data: any) => `
You're on the list! 🎉

Hi ${data.fullName},

Thank you for requesting early access to Easner! We're excited to have you join our community of users who will experience zero-fee international money transfers.

What happens next?
- We'll review your application and use case
- You'll receive an invitation email when approved
- We'll follow up with you via the contact method you provided
- You'll be among the first to experience our platform

Why Easner?
We're building the future of international money transfers with zero fees, real-time exchange rates, and instant transfers. Your early access will help us shape the perfect experience for users like you.

Questions?
If you have any questions about your early access request or our platform, feel free to reach out to us. We're here to help!

© 2025 Easner, Inc. All rights reserved.
    `
  },

  // Admin Transaction Notification
  adminTransactionNotification: {
    subject: (data: any) => `New Transaction ${data.status === 'pending' ? 'Created' : 'Updated'} - #${data.transactionId}`,
    html: (data: any) => {
      const content = `
        <p class="welcome-text">
          ${data.status === 'pending' ? 'New Transaction Created' : `Transaction Status Updated to ${data.status.toUpperCase()}`}
        </p>
        
        <p class="confirmation-text">
          ${data.status === 'pending' 
            ? 'A new transaction has been created and requires your attention.' 
            : `A transaction status has been updated to ${data.status}. Please review the details below.`}
        </p>
        
        ${data.userEmail && data.userEmail !== 'Unknown' ? `
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #007ACC; margin: 0 0 15px 0; font-size: 18px;">User Information</h3>
          <p style="margin: 5px 0; font-size: 16px;"><strong>User ID:</strong> ${data.userId}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>User Email:</strong> ${data.userEmail}</p>
          ${data.userName && data.userName !== 'User' ? `<p style="margin: 5px 0; font-size: 16px;"><strong>User Name:</strong> ${data.userName}</p>` : ''}
        </div>
        ` : ''}
        
        <div class="security-note">
          <h3>Action Required</h3>
          <p>${data.status === 'pending' 
            ? 'Please review this transaction and process it according to your workflow. You can manage it from the admin dashboard.' 
            : 'Please review this status change and take any necessary actions.'}</p>
        </div>
      `

      return generateBaseEmailTemplate(
        data.status === 'pending' ? "New Transaction Created" : `Transaction ${data.status.toUpperCase()}`,
        "",
        content,
        {
          text: "View in Admin Dashboard",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/transactions`
        }
      )
    },
    text: (data: any) => `
${data.status === 'pending' ? 'New Transaction Created' : `Transaction Status Updated to ${data.status.toUpperCase()}`} - #${data.transactionId}

${data.status === 'pending' 
  ? 'A new transaction has been created and requires your attention.' 
  : `A transaction status has been updated to ${data.status}. Please review the details below.`}

${data.userEmail && data.userEmail !== 'Unknown' ? `
User Information:
- User ID: ${data.userId}
- User Email: ${data.userEmail}
${data.userName && data.userName !== 'User' ? `- User Name: ${data.userName}` : ''}
` : ''}

Action Required:
${data.status === 'pending' 
  ? 'Please review this transaction and process it according to your workflow. You can manage it from the admin dashboard.' 
  : 'Please review this status change and take any necessary actions.'}

View in Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin/transactions

© 2025 Easner, Inc. All rights reserved.
    `
  }
}
