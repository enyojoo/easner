// Test script for email service (run with: node scripts/test-email.js)

const { emailService } = require('../lib/email-service')

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n')

  // Test welcome email
  console.log('1. Testing Welcome Email...')
  const welcomeResult = await emailService.sendWelcomeEmail({
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com', // Replace with your test email
    baseCurrency: 'USD',
    dashboardUrl: 'http://localhost:3000/user/dashboard'
  })
  console.log('Welcome Email Result:', welcomeResult)

  // Test transaction completed email
  console.log('\n2. Testing Transaction Completed Email...')
  const transactionResult = await emailService.sendTransactionCompletedEmail('test@example.com', {
    transactionId: 'ETID123456789',
    recipientName: 'Jane Smith',
    sendAmount: 100,
    sendCurrency: 'USD',
    receiveAmount: 150000,
    receiveCurrency: 'NGN',
    exchangeRate: 1500,
    fee: 0,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  console.log('Transaction Email Result:', transactionResult)

  console.log('\n✅ Email service test completed!')
}

// Only run if this file is executed directly
if (require.main === module) {
  testEmailService().catch(console.error)
}

module.exports = { testEmailService }
