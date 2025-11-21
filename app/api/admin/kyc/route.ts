import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { kycService } from "@/lib/kyc-service"
import { supabase } from "@/lib/supabase"

// GET - Get all KYC submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const status = request.nextUrl.searchParams.get("status")
    const submissions = await kycService.getAllSubmissions(status || undefined)
    return NextResponse.json({ submissions })
  } catch (error: any) {
    console.error("Error fetching KYC submissions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch KYC submissions" },
      { status: 500 }
    )
  }
}

// PATCH - Update KYC submission status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { submissionId, status, rejectionReason } = body

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: "Submission ID and status are required" },
        { status: 400 }
      )
    }

    if (!["in_review", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const submission = await kycService.updateStatus(
      submissionId,
      status as "in_review" | "approved" | "rejected",
      user.id,
      rejectionReason
    )

    return NextResponse.json({ submission })
  } catch (error: any) {
    console.error("Error updating KYC submission:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update KYC submission" },
      { status: 500 }
    )
  }
}


