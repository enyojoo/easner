import { supabase } from './supabase'

export interface TransactionData {
  id: string
  transaction_id: string
  user_id: string
  recipient_id: string
  send_amount: number
  send_currency: string
  receive_amount: number
  receive_currency: string
  exchange_rate: number
  fee_amount: number
  fee_type: string
  total_amount: number
  status: string
  reference?: string
  created_at: string
  updated_at: string
  completed_at?: string
  receipt_url?: string
  receipt_filename?: string
  recipient?: {
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
  user?: {
    first_name: string
    last_name: string
    email: string
  }
}

export const transactionService = {
  async create(transactionData: {
    userId: string
    recipientId: string
    sendAmount: number
    sendCurrency: string
    receiveAmount: number
    receiveCurrency: string
    exchangeRate: number
    feeAmount: number
    feeType: string
    totalAmount: number
    transactionId: string
  }): Promise<TransactionData> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionData.transactionId,
        user_id: transactionData.userId,
        recipient_id: transactionData.recipientId,
        send_amount: transactionData.sendAmount,
        send_currency: transactionData.sendCurrency,
        receive_amount: transactionData.receiveAmount,
        receive_currency: transactionData.receiveCurrency,
        exchange_rate: transactionData.exchangeRate,
        fee_amount: transactionData.feeAmount,
        fee_type: transactionData.feeType,
        total_amount: transactionData.totalAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
      .single()

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`)
    }

    return data
  },

  async getById(transactionId: string): Promise<TransactionData> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
      .eq('transaction_id', transactionId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch transaction: ${error.message}`)
    }

    return data
  },

  async getByUserId(userId: string, limit = 20): Promise<TransactionData[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`)
    }

    return data || []
  },

  async updateStatus(transactionId: string, status: string): Promise<void> {
    const updates: any = { status }
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    }
    
    updates.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('transaction_id', transactionId)

    if (error) {
      throw new Error(`Failed to update transaction status: ${error.message}`)
    }
  }
}
