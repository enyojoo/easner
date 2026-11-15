import { ROLE_LABEL, type AdminRole } from "@/lib/roles"
import { sendInviteEmail } from "@/lib/server/invite-email"
import { verifiedClient } from "@/lib/server/blog-server"

export const dynamic = "force-dynamic"

const fail = (error: string, status: number) => Response.json({ error }, { status })

/** Emails the sign-in link for a pending invite. Owner only; the invite itself is created under RLS by the page. */
export async function POST(request: Request) {
  const auth = await verifiedClient(request)
  if (auth instanceof Response) return auth
  const { client, userId } = auth

  let inviteId: unknown
  try {
    inviteId = ((await request.json()) as { inviteId?: unknown }).inviteId
  } catch {
    return fail("That request wasn’t understood.", 400)
  }
  if (typeof inviteId !== "string") return fail("Which invite?", 400)

  const { data: me } = await client.from("admin_members").select("role, name, email").eq("user_id", userId).maybeSingle()
  if (!me || me.role !== "owner") return fail("Only an owner can send invites.", 403)

  const { data: invite } = await client
    .from("admin_invites")
    .select("email, name, role, accepted_at, revoked_at")
    .eq("id", inviteId)
    .maybeSingle()
  if (!invite || invite.accepted_at || invite.revoked_at) return fail("That invite is no longer pending.", 404)

  const configured = process.env.ADMIN_URL?.trim()
  const origin = configured || (process.env.NODE_ENV === "development" ? new URL(request.url).origin : "https://admin.easner.com")

  const result = await sendInviteEmail({
    to: invite.email,
    inviteeName: invite.name,
    inviterName: me.name?.trim() || me.email || "An Easner owner",
    roleLabel: ROLE_LABEL[invite.role as AdminRole] ?? "member",
    signInUrl: `${origin.replace(/\/$/, "")}/auth/login`,
  })
  if (!result.ok) return fail(result.message, result.reason === "not-configured" ? 503 : 502)
  return Response.json({ sent: true })
}
