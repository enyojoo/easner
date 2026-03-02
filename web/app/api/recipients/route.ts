import { type NextRequest, NextResponse } from "next/server"
import { recipientService } from "@/lib/database"
import { requireUser, withErrorHandling } from "@/lib/auth-utils"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const recipients = await recipientService.getByUserId(user.id, user.id)
  return NextResponse.json({ recipients })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const data = await request.json()
  const recipient = await recipientService.create(user.id, data)
  return NextResponse.json({ recipient })
})

