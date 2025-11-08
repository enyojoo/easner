// Test script to send admin transaction notification email
// Load environment variables FIRST before any imports
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
const envLoaded = dotenv.config({ path: resolve(process.cwd(), '.env.local') })
if (!envLoaded.error) {
  console.log('Loaded .env.local')
}
const envLoaded2 = dotenv.config({ path: resolve(process.cwd(), '.env') })
if (!envLoaded2.error) {
  console.log('Loaded .env')
}

// Verify SENDGRID_API_KEY is loaded
if (!process.env.SENDGRID_API_KEY) {
  console.error('ERROR: SENDGRID_API_KEY not found in environment variables')
  process.exit(1)
}

console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET')
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'NOT SET')

async function testAdminEmail() {
  // Now import email service after env vars are loaded
  const { emailService } = await import('../lib/email-service')
  console.log('Testing admin email sending...')
  
  // Test data
  const testData = {
    transactionId: 'TEST-' + Date.now(),
    status: 'pending',
    sendAmount: 100,
    sendCurrency: 'USD',
    receiveAmount: 85000,
    receiveCurrency: 'NGN',
    exchangeRate: 850,
    fee: 5,
    recipientName: 'Test Recipient',
    userId: 'test-user-id',
    userEmail: 'test@example.com',
    userName: 'Test User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    failureReason: null
  }

  const testEmails = ['enyocreative@gmail.com', 'enyo@easner.com']

  for (const email of testEmails) {
    console.log(`\nSending test email to: ${email}`)
    
    try {
      const result = await emailService.sendEmail({
        to: email,
        template: 'adminTransactionNotification',
        data: testData
      })

      if (result.success) {
        console.log(`✅ Email sent successfully to ${email}!`)
        console.log(`   Message ID: ${result.messageId}`)
      } else {
        console.error(`❌ Failed to send email to ${email}`)
        console.error(`   Error: ${result.error}`)
      }
    } catch (error) {
      console.error(`❌ Exception sending email to ${email}:`, error)
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`)
        console.error(`   Stack: ${error.stack}`)
      }
    }
  }

  console.log('\nTest completed!')
  process.exit(0)
}

testAdminEmail().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

