import { supabase } from './supabase'

export interface RecipientData {
  fullName: string
  accountNumber: string
  bankName: string
  currency: string
}

export interface Recipient {
  id: string
  user_id: string
  full_name: string
  account_number: string
  bank_name: string
  phone_number?: string
  currency: string
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
    }
  ): Promise<Recipient> {
    const { data, error } = await supabase
      .from('recipients')
      .update({
        full_name: updates.fullName,
        account_number: updates.accountNumber,
        bank_name: updates.bankName,
        updated_at: new Date().toISOString(),
      })
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
