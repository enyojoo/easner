import { posthog } from './posthog'

export const analytics = {
  // User events
  identify: (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties)
  },

  // Authentication events
  signUp: (method: string = 'email') => {
    posthog.capture('user_signed_up', { method })
  },

  signIn: (method: string = 'email') => {
    posthog.capture('user_signed_in', { method })
  },

  signOut: () => {
    posthog.capture('user_signed_out')
  },

  // Transaction events
  transactionStarted: (data: {
    sendAmount: number
    sendCurrency: string
    receiveCurrency: string
    exchangeRate: number
    fee: number
  }) => {
    posthog.capture('transaction_started', data)
  },

  transactionCompleted: (data: {
    transactionId: string
    sendAmount: number
    sendCurrency: string
    receiveCurrency: string
    exchangeRate: number
    fee: number
    totalAmount: number
  }) => {
    posthog.capture('transaction_completed', data)
  },

  // Currency converter events
  currencyConverted: (data: {
    fromCurrency: string
    toCurrency: string
    amount: number
    convertedAmount: number
    exchangeRate: number
  }) => {
    posthog.capture('currency_converted', data)
  },

  // Recipient events
  recipientAdded: (currency: string) => {
    posthog.capture('recipient_added', { currency })
  },

  // Page events
  pageView: (page: string, properties?: Record<string, any>) => {
    posthog.capture('page_viewed', { page, ...properties })
  },

  // Feature usage
  featureUsed: (feature: string, properties?: Record<string, any>) => {
    posthog.capture('feature_used', { feature, ...properties })
  },

  // Error tracking
  error: (error: string, context?: Record<string, any>) => {
    posthog.capture('error_occurred', { error, ...context })
  },
}
