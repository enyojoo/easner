// Email notification types and interfaces

export interface EmailTemplate {
  subject: string
  html: (data: any) => string
  text: (data: any) => string
}

export interface EmailData {
  to: string
  template: string
  data: any
}

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

export interface WelcomeEmailData {
  firstName: string
  lastName: string
  email: string
  baseCurrency: string
  dashboardUrl: string
}

export interface EmailServiceConfig {
  fromEmail: string
  fromName: string
  replyTo?: string
}

export interface SendGridResponse {
  success: boolean
  messageId?: string
  error?: string
}
