import { posthog } from '@/lib/posthog'

export const analytics = {
  // User identification and authentication
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, properties)
    }
  },

  // Track user registration
  trackSignUp: (method: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture('user_signed_up', {
        method,
        ...properties
      })
    }
  },

  // Track user login
  trackSignIn: (method: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture('user_signed_in', {
        method,
        ...properties
      })
    }
  },

  // Track user logout
  trackSignOut: () => {
    if (typeof window !== 'undefined') {
      posthog.capture('user_signed_out')
      posthog.reset()
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
    if (typeof window !== 'undefined') {
      posthog.capture('transaction_started', properties)
    }
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
    if (typeof window !== 'undefined') {
      posthog.capture('transaction_completed', properties)
    }
  },

  // Currency converter usage
  trackCurrencyConversion: (properties: {
    fromCurrency: string
    toCurrency: string
    amount: number
    convertedAmount: number
    exchangeRate: number
  }) => {
    if (typeof window !== 'undefined') {
      posthog.capture('currency_converted', properties)
    }
  },

  // Recipient management
  trackRecipientAdded: (properties: {
    currency: string
    method: 'manual' | 'import'
  }) => {
    if (typeof window !== 'undefined') {
      posthog.capture('recipient_added', properties)
    }
  },

  trackRecipientSelected: (properties: {
    currency: string
    isExisting: boolean
  }) => {
    if (typeof window !== 'undefined') {
      posthog.capture('recipient_selected', properties)
    }
  },

  // Error tracking
  trackError: (error: string, context?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture('error_occurred', {
        error,
        ...context
      })
    }
  },

  // Feature usage
  trackFeatureUsed: (feature: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture('feature_used', {
        feature,
        ...properties
      })
    }
  },

  // Page views (handled automatically by PostHogProvider)
  trackPageView: (page: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        page,
        ...properties
      })
    }
  },

  // Custom events
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture(event, properties)
    }
  }
}
