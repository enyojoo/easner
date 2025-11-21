import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { kycService } from "@/lib/kyc-service"

// GET - Get user's KYC submissions
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const submissions = await kycService.getByUserId(user.id)
    return NextResponse.json({ submissions })
  } catch (error: any) {
    console.error("Error fetching KYC submissions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch KYC submissions" },
      { status: 500 }
    )
  }
}

// POST - Create new KYC submission
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const type = formData.get("type") as string
    const file = formData.get("file") as File

    if (!type || !file) {
      return NextResponse.json(
        { error: "Type and file are required" },
        { status: 400 }
      )
    }

    if (type === "identity") {
      const country_code = formData.get("country_code") as string
      const id_type = formData.get("id_type") as string

      if (!country_code || !id_type) {
        return NextResponse.json(
          { error: "Country code and ID type are required for identity verification" },
          { status: 400 }
        )
      }

      const submission = await kycService.createIdentitySubmission(user.id, {
        country_code,
        id_type,
        id_document_file: file,
      })

      return NextResponse.json({ submission })
    } else if (type === "address") {
      const document_type = formData.get("document_type") as string

      if (!document_type || (document_type !== "utility_bill" && document_type !== "bank_statement")) {
        return NextResponse.json(
          { error: "Valid document type is required for address verification" },
          { status: 400 }
        )
      }

      const submission = await kycService.createAddressSubmission(user.id, {
        document_type: document_type as "utility_bill" | "bank_statement",
        address_document_file: file,
      })

      return NextResponse.json({ submission })
    } else {
      return NextResponse.json(
        { error: "Invalid submission type" },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Error creating KYC submission:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create KYC submission" },
      { status: 500 }
    )
  }
}

