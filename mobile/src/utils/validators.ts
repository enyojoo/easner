/**
 * Validation utilities for forms
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  return { isValid: true }
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string, country?: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' }
  }
  const digits = phone.replace(/\D/g, '')
  
  // Basic validation - at least 10 digits
  if (digits.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' }
  }
  
  // Country-specific validation can be added here
  return { isValid: true }
}

/**
 * Validate account number
 */
export function validateAccountNumber(account: string, minLength: number = 8): ValidationResult {
  if (!account) {
    return { isValid: false, error: 'Account number is required' }
  }
  const digits = account.replace(/\D/g, '')
  if (digits.length < minLength) {
    return { isValid: false, error: `Account number must be at least ${minLength} digits` }
  }
  return { isValid: true }
}

/**
 * Validate IBAN
 */
export function validateIBAN(iban: string): ValidationResult {
  if (!iban) {
    return { isValid: false, error: 'IBAN is required' }
  }
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  if (cleaned.length < 15 || cleaned.length > 34) {
    return { isValid: false, error: 'IBAN must be between 15 and 34 characters' }
  }
  return { isValid: true }
}

/**
 * Validate amount
 */
export function validateAmount(amount: string, min?: number, max?: number): ValidationResult {
  if (!amount) {
    return { isValid: false, error: 'Amount is required' }
  }
  const numAmount = parseFloat(amount.replace(/,/g, ''))
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Please enter a valid amount' }
  }
  if (min !== undefined && numAmount < min) {
    return { isValid: false, error: `Minimum amount is ${min}` }
  }
  if (max !== undefined && numAmount > max) {
    return { isValid: false, error: `Maximum amount is ${max}` }
  }
  return { isValid: true }
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  return { isValid: true }
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' }
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }
  return { isValid: true }
}






















