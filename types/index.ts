export interface User {
  id: string
  email: string
  full_name: string
  phone_number?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  flag: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  fee_type: "free" | "fixed" | "percentage"
  fee_amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Recipient {
  id: string
  user_id: string
  full_name: string
  account_number: string
  bank_name: string
  currency: string
  phone_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  recipient_id: string
  send_amount: number
  send_currency: string
  receive_amount: number
  receive_currency: string
  exchange_rate: number
  fee_amount: number
  total_amount: number
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  payment_method: string
  reference_number: string
  receipt_url?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: "super_admin" | "admin" | "support"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Settings {
  id: string
  key: string
  value: string
  description?: string
  created_at: string
  updated_at: string
}
