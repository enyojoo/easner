import { supabase } from './supabase'

export interface RecipientData {
  fullName: string
  accountNumber: string
  bankName: string
  currency: string
  routingNumber?: string
  sortCode?: string
  iban?: string
  swiftBic?: string
}

export interface Recipient {
  id: string
  user_id: string
  full_name: string
  account_number: string
  bank_name: string
  phone_number?: string
  currency: string
  routing_number?: string
  sort_code?: string
  iban?: string
  swift_bic?: string
  created_at: string
  updated_at: string
}

export const recipientService = {
  async create(userId: string, recipientData: RecipientData): Promise<Recipient> {
    const { data, error } = await supabase
      .from('recipients')
      .insert({
        user_id: userId,
        full_name: recipientData.fullName,
        account_number: recipientData.accountNumber,
        bank_name: recipientData.bankName,
        currency: recipientData.currency,
        routing_number: recipientData.routingNumber || null,
        sort_code: recipientData.sortCode || null,
        iban: recipientData.iban || null,
        swift_bic: recipientData.swiftBic || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string): Promise<Recipient[]> {
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async update(
    recipientId: string,
    updates: {
      fullName?: string
      accountNumber?: string
      bankName?: string
      routingNumber?: string
      sortCode?: string
      iban?: string
      swiftBic?: string
    }
  ): Promise<Recipient> {
    const updateData: Record<string, any> = {}
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName
    if (updates.accountNumber !== undefined) updateData.account_number = updates.accountNumber
    if (updates.bankName !== undefined) updateData.bank_name = updates.bankName
    if (updates.routingNumber !== undefined) updateData.routing_number = updates.routingNumber || null
    if (updates.sortCode !== undefined) updateData.sort_code = updates.sortCode || null
    if (updates.iban !== undefined) updateData.iban = updates.iban || null
    if (updates.swiftBic !== undefined) updateData.swift_bic = updates.swiftBic || null
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('recipients')
      .update(updateData)
      .eq('id', recipientId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(recipientId: string): Promise<void> {
    const { error } = await supabase
      .from('recipients')
      .delete()
      .eq('id', recipientId)

    if (error) throw error
  },
}
