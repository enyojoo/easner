import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { type, record } = payload

    console.log("Supabase Auth Webhook received:", { type, userId: record?.id })

    // Handle user email confirmation
    if (type === "user.updated" && record?.email_confirmed_at) {
      console.log("User email confirmed, updating verification status:", record.id)
      
      const serverClient = createServerClient()
      
      // Update verification status to 'verified' in users table
      const { error } = await serverClient
        .from("users")
        .update({
          verification_status: "verified",
          updated_at: new Date().toISOString()
        })
        .eq("id", record.id)

      if (error) {
        console.error("Error updating verification status:", error)
        return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 })
      }

      console.log("Verification status updated successfully for user:", record.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
