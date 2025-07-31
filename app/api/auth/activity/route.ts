import { NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function POST() {
  try {
    await SessionManager.updateActivity()
    return NextResponse.json({ message: "Activity updated" })
  } catch (error) {
    console.error("Activity update error:", error)
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 })
  }
}
