import { supabase, createServerClient } from "./supabase"

export interface EarlyAccessRequest {
  id: string
  email: string
  full_name: string
  whatsapp_telegram: string
  primary_use_case: string
  located_in: string
  sending_to: string
  ip_address?: string
  user_agent?: string
  status: 'pending' | 'approved' | 'rejected' | 'contacted'
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateEarlyAccessRequestData {
  email: string
  fullName: string
  whatsappTelegram: string
  primaryUseCase: string
  locatedIn: string
  sendingTo: string
  ipAddress?: string
  userAgent?: string
}

export const earlyAccessService = {
  // Create a new early access request
  async create(data: CreateEarlyAccessRequestData): Promise<EarlyAccessRequest> {
    const { data: result, error } = await supabase
      .from('early_access_requests')
      .insert({
        email: data.email,
        full_name: data.fullName,
        whatsapp_telegram: data.whatsappTelegram,
        primary_use_case: data.primaryUseCase,
        located_in: data.locatedIn,
        sending_to: data.sendingTo,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return result
  },

  // Get all early access requests (admin only)
  async getAll(): Promise<EarlyAccessRequest[]> {
    const { data, error } = await supabase
      .from('early_access_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get early access request by ID
  async getById(id: string): Promise<EarlyAccessRequest | null> {
    const { data, error } = await supabase
      .from('early_access_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get early access request by email
  async getByEmail(email: string): Promise<EarlyAccessRequest | null> {
    const { data, error } = await supabase
      .from('early_access_requests')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update early access request status
  async updateStatus(
    id: string, 
    status: 'pending' | 'approved' | 'rejected' | 'contacted',
    notes?: string
  ): Promise<EarlyAccessRequest> {
    const { data, error } = await supabase
      .from('early_access_requests')
      .update({
        status,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get statistics
  async getStats() {
    const { data: total } = await supabase
      .from('early_access_requests')
      .select('id', { count: 'exact' })

    const { data: pending } = await supabase
      .from('early_access_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')

    const { data: approved } = await supabase
      .from('early_access_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'approved')

    const { data: contacted } = await supabase
      .from('early_access_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'contacted')

    return {
      total: total?.length || 0,
      pending: pending?.length || 0,
      approved: approved?.length || 0,
      contacted: contacted?.length || 0,
    }
  },

  // Get requests by status
  async getByStatus(status: 'pending' | 'approved' | 'rejected' | 'contacted'): Promise<EarlyAccessRequest[]> {
    const { data, error } = await supabase
      .from('early_access_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Search requests
  async search(query: string): Promise<EarlyAccessRequest[]> {
    const { data, error } = await supabase
      .from('early_access_requests')
      .select('*')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,whatsapp_telegram.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
