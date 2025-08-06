import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

// User service
export const userService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: {
    firstName?: string
    lastName?: string
    phone?: string
    baseCurrency?: string
  }) {
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        base_currency: updates.baseCurrency,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateLastLogin(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  }
}

// Transaction service
export const transactionService = {
  async create(transactionData: any) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        recipient:recipients(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async getById(transactionId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
      .eq('transaction_id', transactionId)
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(transactionId: string, status: string, receiptUrl?: string) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (receiptUrl) {
      updateData.receipt_url = receiptUrl
      updateData.receipt_filename = receiptUrl.split('/').pop()
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('transaction_id', transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Recipient service
export const recipientService = {
  async create(recipientData: any) {
    const { data, error } = await supabase
      .from('recipients')
      .insert(recipientData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async update(recipientId: string, updates: any) {
    const { data, error } = await supabase
      .from('recipients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', recipientId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(recipientId: string) {
    const { error } = await supabase
      .from('recipients')
      .delete()
      .eq('id', recipientId)

    if (error) throw error
  }
}

// Currency service - uses caching for better performance
export const currencyService = {
  async getAll() {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('status', 'active')
      .order('code')

    if (error) throw error
    return data || []
  },

  async getExchangeRates() {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('status', 'active')

    if (error) throw error
    return data || []
  },

  async getPaymentMethods(currency?: string) {
    let query = supabase
      .from('payment_methods')
      .select('*')
      .eq('status', 'active')

    if (currency) {
      query = query.eq('currency', currency)
    }

    const { data, error } = await query.order('is_default', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Auth service
export const authService = {
  async signUp(email: string, password: string, userData: any) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          base_currency: userData.baseCurrency || 'USD',
          status: 'active',
          verification_status: 'unverified'
        })

      if (profileError) throw profileError
    }

    return authData
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Update last login
    if (data.user) {
      await userService.updateLastLogin(data.user.id)
    }

    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  }
}
