import { posthog, safePostHogCapture } from '@/lib/posthog'

export const analytics = {
  // User identification and authentication
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, properties)
    }
  },

  // Track user registration
  trackSignUp: (method: string, properties?: Record<string, any>) => {
    safePostHogCapture('user_signed_up', {
      method,
      ...properties
    })
  },

  // Track user login
  trackSignIn: (method: string, properties?: Record<string, any>) => {
    safePostHogCapture('user_signed_in', {
      method,
      ...properties
    })
  },

  // Track user logout
  trackSignOut: () => {
    safePostHogCapture('user_signed_out')
    if (typeof window !== 'undefined') {
      try {
        posthog.reset()
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('PostHog reset failed:', error)
        }
      }
    }
  },

  // Transaction tracking
  trackTransactionStarted: (properties: {
    sendCurrency: string
    receiveCurrency: string
    sendAmount: number
    receiveAmount: number
    exchangeRate: number
    fee: number
  }) => {
    safePostHogCapture('transaction_started', properties)
  },

  trackTransactionCompleted: (properties: {
    transactionId: string
    sendCurrency: string
    receiveCurrency: string
    sendAmount: number
    receiveAmount: number
    exchangeRate: number
    fee: number
    totalAmount: number
  }) => {
    safePostHogCapture('transaction_completed', properties)
  },

  // Currency converter usage
  trackCurrencyConversion: (properties: {
    fromCurrency: string
    toCurrency: string
    amount: number
    convertedAmount: number
    exchangeRate: number
  }) => {
    safePostHogCapture('currency_converted', properties)
  },

  // Recipient management
  trackRecipientAdded: (properties: {
    currency: string
    method: 'manual' | 'import'
  }) => {
    safePostHogCapture('recipient_added', properties)
  },

  trackRecipientSelected: (properties: {
    currency: string
    isExisting: boolean
  }) => {
    safePostHogCapture('recipient_selected', properties)
  },

  // Error tracking
  trackError: (error: string, context?: Record<string, any>) => {
    safePostHogCapture('error_occurred', {
      error,
      ...context
    })
  },

  // Feature usage
  trackFeatureUsed: (feature: string, properties?: Record<string, any>) => {
    safePostHogCapture('feature_used', {
      feature,
      ...properties
    })
  },

  // Page views (handled automatically by PostHogProvider)
  trackPageView: (page: string, properties?: Record<string, any>) => {
    safePostHogCapture('$pageview', {
      $current_url: typeof window !== 'undefined' ? window.location.href : '',
      page,
      ...properties
    })
  },

  // Custom events
  track: (event: string, properties?: Record<string, any>) => {
    safePostHogCapture(event, properties)
  }
}
