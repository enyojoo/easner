import { NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function POST() {
  try {
    await SessionManager.destroySession()
    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
