import { getPostHog } from './posthog'

export const analytics = {
  // User identification and authentication
  identify: (userId: string, properties?: Record<string, any>) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.identify(userId, properties)
    }
  },

  // Track user registration
  trackSignUp: (method: string, properties?: Record<string, any>) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('user_signed_up', {
        method,
        platform: 'mobile',
        ...properties
      })
    }
  },

  // Track user login
  trackSignIn: (method: string, properties?: Record<string, any>) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('user_signed_in', {
        method,
        platform: 'mobile',
        ...properties
      })
    }
  },

  // Track user logout
  trackSignOut: () => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('user_signed_out', {
        platform: 'mobile'
      })
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
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('transaction_started', {
        ...properties,
        platform: 'mobile'
      })
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
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('transaction_completed', {
        ...properties,
        platform: 'mobile'
      })
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
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('currency_converted', {
        ...properties,
        platform: 'mobile'
      })
    }
  },

  // Recipient management
  trackRecipientAdded: (properties: {
    recipientId: string
    bankName: string
    country: string
  }) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('recipient_added', {
        ...properties,
        platform: 'mobile'
      })
    }
  },

  trackRecipientEdited: (properties: {
    recipientId: string
    bankName: string
    country: string
  }) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('recipient_edited', {
        ...properties,
        platform: 'mobile'
      })
    }
  },

  // Screen navigation
  trackScreenView: (screenName: string, properties?: Record<string, any>) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.screen(screenName, {
        ...properties,
        platform: 'mobile'
      })
    }
  },

  // Feature usage
  trackFeatureUsed: (featureName: string, properties?: Record<string, any>) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('feature_used', {
        feature: featureName,
        platform: 'mobile',
        ...properties
      })
    }
  },

  // Error tracking
  trackError: (error: string, properties?: Record<string, any>) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('error_occurred', {
        error,
        platform: 'mobile',
        ...properties
      })
    }
  },

  // App lifecycle
  trackAppOpened: () => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('app_opened', {
        platform: 'mobile'
      })
    }
  },

  trackAppBackgrounded: () => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture('app_backgrounded', {
        platform: 'mobile'
      })
    }
  },

  // User properties
  setUserProperties: (properties: Record<string, any>) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.setPersonProperties(properties)
    }
  },

  // Group properties (for organization-level analytics)
  setGroupProperties: (groupType: string, groupKey: string, properties: Record<string, any>) => {
    const posthog = getPostHog()
    if (posthog) {
      posthog.group(groupType, groupKey, properties)
    }
  }
}
