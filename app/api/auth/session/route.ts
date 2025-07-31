import { NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function GET() {
  try {
    const session = await SessionManager.getSession()

    if (!session) {
      return NextResponse.json({ error: "No valid session" }, { status: 401 })
    }

    return NextResponse.json({
      id: session.userId,
      email: session.email,
      role: session.role,
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Session validation failed" }, { status: 401 })
  }
}
