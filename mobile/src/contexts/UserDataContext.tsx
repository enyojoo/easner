import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { Currency, ExchangeRate, Recipient, Transaction, PaymentMethod } from '../types'

interface UserDataContextType {
  currencies: Currency[]
  exchangeRates: ExchangeRate[]
  recipients: Recipient[]
  transactions: Transaction[]
  paymentMethods: PaymentMethod[]
  loading: boolean
  refreshCurrencies: () => Promise<void>
  refreshExchangeRates: () => Promise<void>
  refreshRecipients: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshPaymentMethods: () => Promise<void>
  refreshAll: () => Promise<void>
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}

interface UserDataProviderProps {
  children: ReactNode
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const { user } = useAuth()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('status', 'active')
        .order('code')

      if (error) throw error
      setCurrencies(data || [])
    } catch (error) {
      console.error('Error fetching currencies:', error)
    }
  }

  const fetchExchangeRates = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select(`
          *,
          from_currency_info:currencies!exchange_rates_from_currency_fkey(id, code, name, symbol, flag_svg),
          to_currency_info:currencies!exchange_rates_to_currency_fkey(id, code, name, symbol, flag_svg)
        `)
        .eq('status', 'active')

      if (error) throw error

      const formattedRates = data?.map((rate) => ({
        ...rate,
        from_currency_info: rate.from_currency_info
          ? {
              ...rate.from_currency_info,
              flag: rate.from_currency_info.flag_svg,
            }
          : undefined,
        to_currency_info: rate.to_currency_info
          ? {
              ...rate.to_currency_info,
              flag: rate.to_currency_info.flag_svg,
            }
          : undefined,
      })) || []

      setExchangeRates(formattedRates)
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
    }
  }

  const fetchRecipients = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecipients(data || [])
    } catch (error) {
      console.error('Error fetching recipients:', error)
    }
  }

  const fetchTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          recipient:recipients(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('currency', { ascending: true })
        .order('is_default', { ascending: false })

      if (error) throw error
      setPaymentMethods(data || [])
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const refreshCurrencies = async () => {
    setLoading(true)
    await fetchCurrencies()
    setLoading(false)
  }

  const refreshExchangeRates = async () => {
    setLoading(true)
    await fetchExchangeRates()
    setLoading(false)
  }

  const refreshRecipients = async () => {
    setLoading(true)
    await fetchRecipients()
    setLoading(false)
  }

  const refreshTransactions = async () => {
    setLoading(true)
    await fetchTransactions()
    setLoading(false)
  }

  const refreshPaymentMethods = async () => {
    setLoading(true)
    await fetchPaymentMethods()
    setLoading(false)
  }

  const refreshAll = async () => {
    setLoading(true)
    await Promise.all([
      fetchCurrencies(),
      fetchExchangeRates(),
      fetchRecipients(),
      fetchTransactions(),
      fetchPaymentMethods(),
    ])
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      refreshAll()
    } else {
      // Clear data when user logs out
      setCurrencies([])
      setExchangeRates([])
      setRecipients([])
      setTransactions([])
      setPaymentMethods([])
    }
  }, [user])

  const value = {
    currencies,
    exchangeRates,
    recipients,
    transactions,
    paymentMethods,
    loading,
    refreshCurrencies,
    refreshExchangeRates,
    refreshRecipients,
    refreshTransactions,
    refreshPaymentMethods,
    refreshAll,
  }

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
}
