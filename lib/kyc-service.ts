import { supabase } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface KYCSubmission {
  id: string
  user_id: string
  type: "identity" | "address"
  status: "pending" | "in_review" | "approved" | "rejected"
  country_code?: string
  full_name?: string // Full name from identity document
  date_of_birth?: string // Date of birth from identity document (ISO date string)
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
  full_name: string
  date_of_birth: string // ISO date string (YYYY-MM-DD)
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
  // Returns file path (not public URL) for secure access via RLS policies
  async uploadFile(file: File, folder: string, userId: string, client?: SupabaseClient): Promise<{ path: string; filename: string }> {
    const storageClient = client || supabase
    
    // Sanitize the original filename: remove special characters, replace spaces with underscores
    // Keep only alphanumeric, dots, hyphens, and underscores
    const sanitizeFilename = (name: string): string => {
      // Get the base name and extension separately
      const lastDotIndex = name.lastIndexOf('.')
      const baseName = lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name
      const extension = lastDotIndex > 0 ? name.substring(lastDotIndex) : ''
      
      // Sanitize base name: replace spaces and special chars, keep only safe characters
      const sanitized = baseName
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      
      // Limit length to prevent issues (max 200 chars for base name)
      const truncated = sanitized.length > 200 ? sanitized.substring(0, 200) : sanitized
      
      return truncated + extension
    }
    
    const sanitizedOriginalName = sanitizeFilename(file.name)
    // Keep userId prefix for RLS policy compatibility: userId_originalfilename.ext
    // Store files in folder structure: folder/userId_filename.ext
    const fileName = `${userId}_${sanitizedOriginalName}`
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

    // Return the file path (not public URL) for secure storage
    // Path format: "identity/userId_filename.ext" or "address/userId_filename.ext"
    return { path: filePath, filename: file.name }
  },

  // Create identity verification submission
  async createIdentitySubmission(
    userId: string,
    data: CreateIdentitySubmission,
    client?: SupabaseClient
  ): Promise<KYCSubmission> {
    const dbClient = client || supabase
    // Upload document - returns path, not public URL
    const { path, filename } = await this.uploadFile(
      data.id_document_file,
      "identity",
      userId,
      client
    )

    // Check if user already has an identity submission
    const { data: existing, error: checkError } = await dbClient
      .from("kyc_submissions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("type", "identity")
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // Prevent new uploads if already in_review or approved
    if (existing && (existing.status === "in_review" || existing.status === "approved")) {
      throw new Error("Your identity verification is already under review or approved. You cannot upload a new document.")
    }

    if (existing) {
      // Allow updates to pending submissions
      
      // Update existing pending submission
      // Store file path in id_document_url field (for backward compatibility)
      const { data: updatedData, error } = await dbClient
        .from("kyc_submissions")
        .update({
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          country_code: data.country_code,
          id_type: data.id_type,
          id_document_url: path, // Store path instead of public URL
          id_document_filename: filename,
          status: "in_review", // Change status to in_review after upload
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      return updatedData
    } else {
      // Create new submission with in_review status
      // Store file path in id_document_url field (for backward compatibility)
      const { data: submissionData, error } = await dbClient
        .from("kyc_submissions")
        .insert({
          user_id: userId,
          type: "identity",
          status: "in_review", // New submissions start as in_review
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          country_code: data.country_code,
          id_type: data.id_type,
          id_document_url: path, // Store path instead of public URL
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
    // Upload document - returns path, not public URL
    const { path, filename } = await this.uploadFile(
      data.address_document_file,
      "address",
      userId,
      client
    )

    // Check if user already has a pending or in_review address submission
    const { data: existing, error: checkError } = await dbClient
      .from("kyc_submissions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("type", "address")
      .in("status", ["pending", "in_review"])
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing) {
      // If already in review, don't allow updates
      if (existing.status === "in_review") {
        throw new Error("Your address verification is already under review. Please wait for admin approval.")
      }
      
      // Allow updates to pending submissions - change to in_review after upload
      // Store file path in address_document_url field (for backward compatibility)
      const { data: updatedData, error } = await dbClient
        .from("kyc_submissions")
        .update({
          country_code: data.country_code,
          address: data.address,
          document_type: data.document_type,
          address_document_url: path, // Store path instead of public URL
          address_document_filename: filename,
          status: "in_review", // Change to in_review after upload
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      return updatedData
    } else {
      // Create new submission with in_review status
      // Store file path in address_document_url field (for backward compatibility)
      const { data: submissionData, error } = await dbClient
        .from("kyc_submissions")
        .insert({
          user_id: userId,
          type: "address",
          status: "in_review", // Start as in_review after upload
          country_code: data.country_code,
          address: data.address,
          document_type: data.document_type,
          address_document_url: path, // Store path instead of public URL
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

  // Admin: Delete submission
  async deleteSubmission(submissionId: string, client?: SupabaseClient): Promise<void> {
    const dbClient = client || supabase
    const { error } = await dbClient
      .from("kyc_submissions")
      .delete()
      .eq("id", submissionId)

    if (error) throw error
  },

  // Get signed URL for viewing a document (for users viewing their own files)
  async getSignedUrl(filePath: string, expiresIn: number = 3600, client?: SupabaseClient): Promise<string> {
    const storageClient = client || supabase
    
    const { data, error } = await storageClient.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, expiresIn)
    
    if (error) {
      console.error("Error generating signed URL:", error)
      throw new Error(`Failed to generate signed URL: ${error.message}`)
    }
    
    return data.signedUrl
  },
}

