import { supabase } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface KYCSubmission {
  id: string
  user_id: string
  type: "identity" | "address"
  status: "pending" | "in_review" | "approved" | "rejected"
  country_code?: string
  id_type?: string
  id_document_url?: string
  id_document_filename?: string
  document_type?: string // 'utility_bill' or 'bank_statement'
  address?: string // User-entered address text
  address_document_url?: string
  address_document_filename?: string
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface CreateIdentitySubmission {
  country_code: string
  id_type: string
  id_document_file: File
}

export interface CreateAddressSubmission {
  country_code: string
  address: string
  document_type: "utility_bill" | "bank_statement"
  address_document_file: File
}

export const kycService = {
  // Get user's KYC submissions
  async getByUserId(userId: string, client?: SupabaseClient): Promise<KYCSubmission[]> {
    const dbClient = client || supabase
    const { data, error } = await dbClient
      .from("kyc_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array instead of throwing
      if (error.code === 'PGRST205' || error.message?.includes('kyc_submissions')) {
        console.warn("KYC submissions table not found. Please run the migration.")
        return []
      }
      throw error
    }
    return data || []
  },

  // Get specific submission
  async getById(submissionId: string, client?: SupabaseClient): Promise<KYCSubmission | null> {
    const dbClient = client || supabase
    const { data, error } = await dbClient
      .from("kyc_submissions")
      .select("*")
      .eq("id", submissionId)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }
    return data
  },

  // Upload file to Supabase Storage
  async uploadFile(file: File, folder: string, userId: string, client?: SupabaseClient): Promise<{ url: string; filename: string }> {
    const storageClient = client || supabase
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}_${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data: uploadData, error: uploadError } = await storageClient.storage
      .from("kyc-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const {
      data: { publicUrl },
    } = storageClient.storage.from("kyc-documents").getPublicUrl(filePath)

    return { url: publicUrl, filename: fileName }
  },

  // Create identity verification submission
  async createIdentitySubmission(
    userId: string,
    data: CreateIdentitySubmission,
    client?: SupabaseClient
  ): Promise<KYCSubmission> {
    const dbClient = client || supabase
    // Upload document
    const { url, filename } = await this.uploadFile(
      data.id_document_file,
      "identity",
      userId,
      client
    )

    // Check if user already has a pending identity submission (allow updates to pending only)
    const { data: existing, error: checkError } = await dbClient
      .from("kyc_submissions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("type", "identity")
      .eq("status", "pending")
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing) {
      // Allow updates to pending submissions
      
      // Update existing pending submission
      const { data: updatedData, error } = await dbClient
        .from("kyc_submissions")
        .update({
          country_code: data.country_code,
          id_type: data.id_type,
          id_document_url: url,
          id_document_filename: filename,
          status: "pending", // Start as pending
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      return updatedData
    } else {
      // Create new submission with pending status
      const { data: submissionData, error } = await dbClient
        .from("kyc_submissions")
        .insert({
          user_id: userId,
          type: "identity",
          status: "pending", // Start as pending
          country_code: data.country_code,
          id_type: data.id_type,
          id_document_url: url,
          id_document_filename: filename,
        })
        .select()
        .single()

      if (error) throw error
      return submissionData
    }
  },

  // Create address verification submission
  async createAddressSubmission(
    userId: string,
    data: CreateAddressSubmission,
    client?: SupabaseClient
  ): Promise<KYCSubmission> {
    const dbClient = client || supabase
    // Upload document
    const { url, filename } = await this.uploadFile(
      data.address_document_file,
      "address",
      userId,
      client
    )

    // Check if user already has a pending address submission (allow updates to pending only)
    const { data: existing, error: checkError } = await dbClient
      .from("kyc_submissions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("type", "address")
      .eq("status", "pending")
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing) {
      // Allow updates to pending submissions
      
      // Update existing pending submission
      const { data: updatedData, error } = await dbClient
        .from("kyc_submissions")
        .update({
          country_code: data.country_code,
          address: data.address,
          document_type: data.document_type,
          address_document_url: url,
          address_document_filename: filename,
          status: "pending", // Start as pending
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      return updatedData
    } else {
      // Create new submission with pending status
      const { data: submissionData, error } = await dbClient
        .from("kyc_submissions")
        .insert({
          user_id: userId,
          type: "address",
          status: "pending", // Start as pending
          country_code: data.country_code,
          address: data.address,
          document_type: data.document_type,
          address_document_url: url,
          address_document_filename: filename,
        })
        .select()
        .single()

      if (error) throw error
      return submissionData
    }
  },

  // Admin: Get all submissions
  async getAllSubmissions(status?: string): Promise<KYCSubmission[]> {
    let query = supabase.from("kyc_submissions").select("*")

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Admin: Update submission status
  async updateStatus(
    submissionId: string,
    status: "in_review" | "approved" | "rejected",
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<KYCSubmission> {
    const updateData: any = {
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    }

    if (status === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const { data, error } = await supabase
      .from("kyc_submissions")
      .update(updateData)
      .eq("id", submissionId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

