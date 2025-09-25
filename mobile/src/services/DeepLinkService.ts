import * as Linking from 'expo-linking'
import { Alert } from 'react-native'

export interface DeepLinkData {
  screen: string
  params?: Record<string, string>
}

export class DeepLinkService {
  private static instance: DeepLinkService
  private linkingPrefix: string

  constructor() {
    this.linkingPrefix = Linking.createURL('/')
  }

  static getInstance(): DeepLinkService {
    if (!DeepLinkService.instance) {
      DeepLinkService.instance = new DeepLinkService()
    }
    return DeepLinkService.instance
  }

  /**
   * Initialize deep linking
   */
  async initialize(): Promise<void> {
    try {
      // Handle deep links when app is already running
      const subscription = Linking.addEventListener('url', this.handleDeepLink)
      
      // Handle deep links when app is opened from a closed state
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl) {
        this.handleDeepLink({ url: initialUrl })
      }

      return () => subscription?.remove()
    } catch (error) {
      console.error('DeepLinkService: Error initializing deep linking:', error)
    }
  }

  /**
   * Handle incoming deep links
   */
  private handleDeepLink = (event: { url: string }): void => {
    try {
      console.log('DeepLinkService: Received deep link:', event.url)
      
      const { screen, params } = this.parseUrl(event.url)
      
      if (screen) {
        this.navigateToScreen(screen, params)
      }
    } catch (error) {
      console.error('DeepLinkService: Error handling deep link:', error)
    }
  }

  /**
   * Parse URL to extract screen and parameters
   */
  private parseUrl(url: string): DeepLinkData {
    try {
      // Remove the scheme and domain
      const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '')
      
      // Parse the path
      const segments = cleanUrl.split('/').filter(Boolean)
      
      if (segments.length === 0) {
        return { screen: 'Dashboard' }
      }

      // Map URL paths to screen names
      const screenMap: Record<string, string> = {
        'user': 'Dashboard',
        'user/dashboard': 'Dashboard',
        'user/transactions': 'Transactions',
        'user/send/': 'TransactionDetails',
        'user/recipients': 'Recipients',
        'user/send': 'Send',
        'user/support': 'Support',
        'user/profile': 'Profile'
      }

      let screen = screenMap[segments.join('/')]
      let params: Record<string, string> = {}

      // Handle transaction details with ID
      if (segments[0] === 'user' && segments[1] === 'transactions' && segments[2]) {
        screen = 'TransactionDetails'
        params = { transactionId: segments[2] }
      }

      // Handle other dynamic routes
      if (!screen) {
        screen = 'Dashboard' // Default fallback
      }

      return { screen, params }
    } catch (error) {
      console.error('DeepLinkService: Error parsing URL:', error)
      return { screen: 'Dashboard' }
    }
  }

  /**
   * Navigate to the appropriate screen
   */
  private navigateToScreen(screen: string, params: Record<string, string> = {}): void {
    try {
      console.log('DeepLinkService: Navigating to screen:', screen, 'with params:', params)
      
      // This will be handled by the navigation system
      // We'll emit a custom event that the navigation can listen to
      const event = new CustomEvent('deepLinkNavigate', {
        detail: { screen, params }
      })
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(event)
      }
    } catch (error) {
      console.error('DeepLinkService: Error navigating to screen:', error)
    }
  }

  /**
   * Create a deep link URL
   */
  createDeepLink(screen: string, params: Record<string, string> = {}): string {
    try {
      const baseUrl = 'https://easner.com'
      
      const screenMap: Record<string, string> = {
        'Dashboard': '/user/dashboard',
        'Transactions': '/user/transactions',
        'TransactionDetails': '/user/transactions',
        'Recipients': '/user/recipients',
        'Send': '/user/send',
        'Support': '/user/support',
        'Profile': '/user/profile'
      }

      let path = screenMap[screen] || '/user/dashboard'
      
      // Add transaction ID if provided
      if (screen === 'TransactionDetails' && params.transactionId) {
        path += `/${params.transactionId}`
      }

      return `${baseUrl}${path}`
    } catch (error) {
      console.error('DeepLinkService: Error creating deep link:', error)
      return 'https://easner.com/user/dashboard'
    }
  }

  /**
   * Check if the app can handle a URL
   */
  canHandleUrl(url: string): boolean {
    try {
      return url.includes('easner.com') || url.includes('easner://')
    } catch (error) {
      console.error('DeepLinkService: Error checking URL:', error)
      return false
    }
  }
}

export const deepLinkService = DeepLinkService.getInstance()
