import { supabase } from './supabase'

/**
 * Get the API base URL from environment or use default
 */
const getApiBaseUrl = (): string => {
  // Try to get from environment variable first
  const apiUrl = process.env.EXPO_PUBLIC_API_URL
  
  if (apiUrl) {
    // Remove trailing slash if present
    return apiUrl.replace(/\/$/, '')
  }
  
  // Fallback: For development, try to extract from Supabase URL
  // This assumes the API is hosted on the same domain as the web app
  // In production, you should set EXPO_PUBLIC_API_URL
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
  if (supabaseUrl) {
    // If Supabase URL is something like https://xxx.supabase.co
    // and your API is on a different domain, you need to set EXPO_PUBLIC_API_URL
    // For now, we'll return empty to use relative URLs (works if API is on same domain)
    console.warn('EXPO_PUBLIC_API_URL not set, using relative URLs. Set this env var for production.')
    return ''
  }
  
  // Last resort: return empty string (will use relative URLs)
  return ''
}

/**
 * Make an authenticated API request
 * Automatically includes the Supabase access token in the Authorization header
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // Get current session to extract access token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error getting session:', sessionError)
      throw new Error('Authentication required')
    }
    
    if (!session?.access_token) {
      throw new Error('No access token found')
    }
    
    // Build full URL
    const apiBase = getApiBaseUrl()
    let url: string
    
    if (endpoint.startsWith('http')) {
      // Already a full URL
      url = endpoint
    } else if (apiBase) {
      // Use API base URL
      url = `${apiBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
    } else {
      // Use relative URL (assumes API is on same domain as web app)
      // This works if you're using a proxy or the API is on the same domain
      url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    }
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    }
    
    // Make the request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
    const response = await fetch(url, {
      ...options,
      headers,
        signal: controller.signal,
    })
      clearTimeout(timeoutId)
    return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Network request timed out')
      }
      throw error
    }
  } catch (error: any) {
    // Handle network errors gracefully
    if (error?.message === 'Network request failed' || error?.name === 'TypeError' || error?.message?.includes('fetch')) {
      console.warn('API request failed (network error):', error?.message || 'Network unavailable')
      // Create a custom response object that indicates network failure
      // Use status 503 (Service Unavailable) to indicate network issues
      const errorResponse = new Response(
        JSON.stringify({ 
          error: 'Network request failed', 
          message: 'Unable to connect to server. Please check your internet connection.' 
        }),
        {
          status: 503,
          statusText: 'Network Error',
          headers: { 'Content-Type': 'application/json' },
        }
      )
      // Mark as network error for easy detection
      ;(errorResponse as any).isNetworkError = true
      return errorResponse
    }
    console.error('API request error:', error)
    throw error
  }
}

/**
 * Helper for GET requests
 */
export const apiGet = async (endpoint: string): Promise<Response> => {
  return apiRequest(endpoint, { method: 'GET' })
}

/**
 * Helper for POST requests
 */
export const apiPost = async (endpoint: string, body?: any): Promise<Response> => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Helper for PATCH requests
 */
export const apiPatch = async (endpoint: string, body?: any): Promise<Response> => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Helper for DELETE requests
 */
export const apiDelete = async (endpoint: string): Promise<Response> => {
  return apiRequest(endpoint, { method: 'DELETE' })
}

