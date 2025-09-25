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
        "Cross-border transfers in under 5 minutes",
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
    subject: (data: TransactionEmailData) => `Payment Required - Transaction #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="welcome-text">
          Payment Required for Your Transfer
        </p>
        
        <p class="confirmation-text">
          Your transfer to ${data.recipientName} is ready to be processed. 
          Complete your payment now and your money will reach its destination soon!
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>Next Steps</h3>
          <p>Complete your payment using the method provided in your dashboard. Once confirmed, your money will be sent and arrive soon!</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Payment Required",
        "Complete payment for instant transfer",
        content,
        {
          text: "Complete Payment",
          url: `https://www.easner.com/user/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Payment Required - Transaction #${data.transactionId}

Your transfer to ${data.recipientName} is ready to be processed. Complete your payment now and your money will reach its destination soon!

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}
- Status: ${data.status}

Next Steps:
Complete your payment using the method provided in your dashboard. Once confirmed, your money will be sent and arrive soon!

Complete Payment: https://www.easner.com/user/send/${data.transactionId.toLowerCase()}

Need help? Contact us at support@easner.com
    `
  },

  // Transaction Processing
  transactionProcessing: {
    subject: (data: TransactionEmailData) => `Transfer Processing - Transaction #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="welcome-text">
          Your Transfer is Being Processed
        </p>
        
        <p class="confirmation-text">
          Great news! We've received your payment and your transfer to ${data.recipientName} is now being processed. 
          Your money will arrive soon!
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What's Happening</h3>
          <p>We're working with our banking partners to complete your transfer. Thanks to our advanced technology, this is processed quickly!</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Processing",
        content,
        {
          text: "Track Transfer",
          url: `https://www.easner.com/user/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Processing - Transaction #${data.transactionId}

Great news! We've received your payment and your transfer to ${data.recipientName} is now being processed. Your money will arrive soon!

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}
- Status: ${data.status}

What's Happening:
We're working with our banking partners to complete your transfer. Thanks to our advanced technology, this is processed quickly!

Track Transfer: https://www.easner.com/user/send/${data.transactionId.toLowerCase()}

Need help? Contact us at support@easner.com
    `
  },

  // Transaction Completed
  transactionCompleted: {
    subject: (data: TransactionEmailData) => `Transfer Completed Successfully! 🎉 Transaction #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="welcome-text">
          Transfer Completed Successfully! 🎉
        </p>
        
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
        content,
        {
          text: "View Transaction",
          url: `https://www.easner.com/user/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Completed - Transaction #${data.transactionId}

Transfer Completed Successfully! 🎉

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
        <p class="welcome-text">
          Transfer Failed
        </p>
        
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
        "We're here to help resolve this",
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
        <p class="welcome-text">
          Transfer Cancelled
        </p>
        
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
        "Your transfer has been cancelled",
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
  }
}
