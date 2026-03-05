import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { currencySymbols } from '@/lib/mock-data'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format amount with currency symbol only (no currency code) */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] ?? '$'
  return `${symbol}${amount.toFixed(2)}`
}

export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  })
}
