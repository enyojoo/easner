import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { code, name, symbol, is_active } = await request.json()

    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("currencies")
      .insert({ code, name, symbol, is_active })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ currency: data })
  } catch (error) {
    console.error("Error adding currency:", error)
    return NextResponse.json({ error: "Failed to add currency" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Currency code is required" }, { status: 400 })
    }

    const serverClient = createServerClient()
    const { error } = await serverClient
      .from("currencies")
      .delete()
      .eq("code", code)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting currency:", error)
    return NextResponse.json({ error: "Failed to delete currency" }, { status: 500 })
  }
}