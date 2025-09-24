import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { verification_status } = await request.json()
    const userId = params.id

    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("users")
      .update({ verification_status })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error("Error updating user verification:", error)
    return NextResponse.json({ error: "Failed to update user verification" }, { status: 500 })
  }
}
