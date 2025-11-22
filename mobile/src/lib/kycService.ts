import { supabase } from './supabase'

export interface KYCSubmission {
  id: string
  user_id: string
  type: "identity" | "address"
  status: "pending" | "in_review" | "approved" | "rejected"
  country_code?: string
  full_name?: string
  date_of_birth?: string
  id_type?: string
  id_document_url?: string
  id_document_filename?: string
  document_type?: string
  address?: string
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
  id_document_file: any // File or asset for React Native
}

export interface CreateAddressSubmission {
  country_code: string
  address: string
  document_type: "utility_bill" | "bank_statement"
  address_document_file: any // File or asset for React Native
}

export const kycService = {
  // Get user's KYC submissions
  async getByUserId(userId: string): Promise<KYCSubmission[]> {
    const { data, error } = await supabase
      .from("kyc_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('kyc_submissions')) {
        console.warn("KYC submissions table not found. Please run the migration.")
        return []
      }
      throw error
    }
    return data || []
  },

  // Get specific submission
  async getById(submissionId: string): Promise<KYCSubmission | null> {
    const { data, error } = await supabase
      .from("kyc_submissions")
      .select("*")
      .eq("id", submissionId)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data
  },

  // Upload file to Supabase Storage
  // Returns file path (not public URL) for secure access via RLS policies
  async uploadFile(file: any, folder: string, userId: string): Promise<{ path: string; filename: string }> {
    // For React Native, file comes from DocumentPicker with uri property
    const originalFileName = file.name || `document.${file.mimeType?.split('/')[1] || 'jpg'}`
    
    // Sanitize filename
    const sanitizedFileName = originalFileName
      .replace(/[^a-zA-Z0-9-_\.]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 200)

    const fileNameInStorage = `${userId}_${sanitizedFileName}`
    const filePath = `${folder}/${fileNameInStorage}`

    // For React Native, convert file URI to blob
    let fileData: Blob
    
    if (file.uri) {
      // React Native file from DocumentPicker
      const response = await fetch(file.uri)
      fileData = await response.blob()
    } else if (file instanceof Blob || file instanceof File) {
      fileData = file
    } else {
      throw new Error("Invalid file format")
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(filePath, fileData, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.mimeType || 'application/octet-stream',
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Return the file path (not public URL) for secure storage
    // Path format: "identity/userId_filename.ext" or "address/userId_filename.ext"
    return { path: filePath, filename: originalFileName }
  },

  // Create identity submission
  async createIdentitySubmission(
    userId: string,
    data: CreateIdentitySubmission
  ): Promise<KYCSubmission> {
    const { path, filename } = await this.uploadFile(
      data.id_document_file,
      "identity",
      userId
    )

    // Check for existing submission
    const { data: existing, error: checkError } = await supabase
      .from("kyc_submissions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("type", "identity")
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing && (existing.status === "in_review" || existing.status === "approved")) {
      throw new Error("Your identity verification is already under review or approved. You cannot upload a new document.")
    }

    const submissionData = {
      user_id: userId,
      type: "identity",
      status: "in_review",
      full_name: data.full_name,
      date_of_birth: data.date_of_birth,
      country_code: data.country_code,
      id_type: data.id_type,
      id_document_url: path, // Store path instead of public URL
      id_document_filename: filename,
    }

    if (existing) {
      // Update existing submission
      const { data: updatedData, error } = await supabase
        .from("kyc_submissions")
        .update(submissionData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      return updatedData
    } else {
      // Create new submission
      const { data: newSubmissionData, error } = await supabase
        .from("kyc_submissions")
        .insert(submissionData)
        .select()
        .single()

      if (error) throw error
      return newSubmissionData
    }
  },

  // Create address submission
  async createAddressSubmission(
    userId: string,
    data: CreateAddressSubmission
  ): Promise<KYCSubmission> {
    const { path, filename } = await this.uploadFile(
      data.address_document_file,
      "address",
      userId
    )

    // Check for existing submission
    const { data: existing, error: checkError } = await supabase
      .from("kyc_submissions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("type", "address")
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing && (existing.status === "in_review" || existing.status === "approved")) {
      throw new Error("Your address verification is already under review or approved. You cannot upload a new document.")
    }

    const submissionData = {
      user_id: userId,
      type: "address",
      status: "in_review",
      country_code: data.country_code,
      address: data.address,
      document_type: data.document_type,
      address_document_url: path, // Store path instead of public URL
      address_document_filename: filename,
    }

    if (existing) {
      // Update existing submission
      const { data: updatedData, error } = await supabase
        .from("kyc_submissions")
        .update(submissionData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      return updatedData
    } else {
      // Create new submission
      const { data: newSubmissionData, error } = await supabase
        .from("kyc_submissions")
        .insert(submissionData)
        .select()
        .single()

      if (error) throw error
      return newSubmissionData
    }
  },
}

