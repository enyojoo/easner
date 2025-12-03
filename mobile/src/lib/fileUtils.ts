// File utility functions for mobile app

/**
 * Convert a file URI to base64 string
 * Used for Bridge API which requires base64 encoded images
 */
/**
 * Base64 encode helper (with fallback for React Native)
 */
function base64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(str)
  }
  // Fallback for environments without btoa
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  let i = 0
  while (i < str.length) {
    const a = str.charCodeAt(i++)
    const b = i < str.length ? str.charCodeAt(i++) : 0
    const c = i < str.length ? str.charCodeAt(i++) : 0
    const bitmap = (a << 16) | (b << 8) | c
    result += chars.charAt((bitmap >> 18) & 63)
    result += chars.charAt((bitmap >> 12) & 63)
    result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '='
    result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '='
  }
  return result
}

export async function fileToBase64(fileUri: string): Promise<string> {
  try {
    const response = await fetch(fileUri)
    // Use arrayBuffer instead of blob for React Native compatibility
    const arrayBuffer = await response.arrayBuffer()
    
    // Convert ArrayBuffer to base64
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = base64Encode(binary)
    
    return base64
  } catch (error) {
    console.error('Error converting file to base64:', error)
    throw new Error('Failed to convert file to base64')
  }
}

/**
 * Convert base64 string to data URL format
 */
export function base64ToDataURL(base64: string, mimeType: string = 'image/jpeg'): string {
  return `data:${mimeType};base64,${base64}`
}

