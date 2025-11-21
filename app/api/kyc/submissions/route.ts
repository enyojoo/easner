import { NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { kycService } from "@/lib/kyc-service"
import { createServerSupabaseClient } from "@/lib/supabase-server-helpers"

// GET - Get user's KYC submissions
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  // Use server-side client with user's session
  const { client } = createServerSupabaseClient(request)
  const submissions = await kycService.getByUserId(user.id, client)
  return NextResponse.json({ submissions })
})

// POST - Create new KYC submission
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  // Use server-side client with user's session for storage uploads
  const { client } = createServerSupabaseClient(request)

  const formData = await request.formData()
  const type = formData.get("type") as string
  const file = formData.get("file") as File

  if (!type || !file) {
    return createErrorResponse("Type and file are required", 400)
  }

  if (type === "identity") {
    const country_code = formData.get("country_code") as string
    const id_type = formData.get("id_type") as string

    if (!country_code || !id_type) {
      return createErrorResponse("Country code and ID type are required for identity verification", 400)
    }

    const submission = await kycService.createIdentitySubmission(user.id, {
      country_code,
      id_type,
      id_document_file: file,
    }, client)

    return NextResponse.json({ submission })
  } else if (type === "address") {
    const document_type = formData.get("document_type") as string

    if (!document_type || (document_type !== "utility_bill" && document_type !== "bank_statement")) {
      return createErrorResponse("Valid document type is required for address verification", 400)
    }

    const submission = await kycService.createAddressSubmission(user.id, {
      document_type: document_type as "utility_bill" | "bank_statement",
      address_document_file: file,
    }, client)

    return NextResponse.json({ submission })
  } else {
    return createErrorResponse("Invalid submission type", 400)
  }
})
