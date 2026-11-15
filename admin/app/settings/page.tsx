"use client"

import { Suspense, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Lock, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { SimpleTableSkeleton } from "@/components/admin-skeletons"
import { FilterTabs } from "@/components/ui/filter-tabs"
import { PageHeader } from "@/components/ui/page-header"
import { CategoriesTab } from "@/components/settings/categories-tab"
import { MediaTab } from "@/components/settings/media-tab"
import { RedirectsTab } from "@/components/settings/redirects-tab"
import { settingsTabs, type SettingsTab } from "@/lib/nav-config"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsSection } from "@/components/ui/settings-section"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { adminKeys, errorMessage, formatListDate, useTeam, type InviteRow, type MemberRow } from "@/lib/queries"
import { permissionsFor, ROLE_DESCRIPTION, ROLE_LABEL, type AdminRole } from "@/lib/roles"
import { sendInviteEmailFor } from "@/lib/blog/post-api"
import { supabase } from "@/lib/supabase"

/** There is one owner (the person who set the site up). Everyone else is invited as an editor or a writer. */
const ROLES: AdminRole[] = ["editor", "writer"]
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const COLUMNS = ["Member", "Role", "Status", "Added", ""]

type TeamRow =
  | { kind: "member"; key: string; member: MemberRow }
  | { kind: "invite"; key: string; invite: InviteRow }

function RoleSelect({
  value,
  onChange,
  disabled,
  label,
}: {
  value: AdminRole
  onChange: (role: AdminRole) => void
  disabled?: boolean
  label: string
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as AdminRole)} disabled={disabled}>
      <SelectTrigger aria-label={label} className="h-9 w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {ROLE_LABEL[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<AdminRole>("writer")
  const normalized = email.trim().toLowerCase()
  const valid = EMAIL_PATTERN.test(normalized)

  const invite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("admin_invites")
        .insert({ email: normalized, name: name.trim(), role, invited_by: user?.id })
        .select("id")
        .single()
      if (error) throw error
      // The invite is saved either way; a failed email is reported, not undone, and can be resent from the list.
      try {
        await sendInviteEmailFor(data.id as string)
        return { emailed: true as const }
      } catch (emailError) {
        return { emailed: false as const, reason: errorMessage(emailError, "The email didn’t send.") }
      }
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.team() })
      if (result.emailed) toast.success(`Invite sent to ${normalized}`)
      else toast.warning(`${normalized} is invited, but the email didn’t send`, { description: `${result.reason} Use Resend on their row.` })
      setEmail("")
      setName("")
      setRole("writer")
      onOpenChange(false)
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn’t invite. Try again.")),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (valid && !invite.isPending) invite.mutate()
          }}
        >
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
            <DialogDescription>
              They sign in at admin.easner.com with a code sent to this email, then set up an authenticator app.
            </DialogDescription>
          </DialogHeader>
          <Field label="Work email">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" autoFocus />
          </Field>
          <Field label="Name" optional>
            <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} />
          </Field>
          <Field label="Role" hint={ROLE_DESCRIPTION[role]}>
            <Select value={role} onValueChange={(next) => setRole(next as AdminRole)}>
              <SelectTrigger aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ROLE_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={invite.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!valid} loading={invite.isPending} loadingLabel="Inviting…">
              Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TeamSection() {
  const queryClient = useQueryClient()
  const { user, role: viewerRole } = useAuth()
  const { canManageTeam } = permissionsFor(viewerRole)
  const teamQuery = useTeam()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [pendingRemoval, setPendingRemoval] = useState<TeamRow | null>(null)

  const rows = useMemo<TeamRow[]>(() => {
    const data = teamQuery.data
    if (!data) return []
    return [
      ...data.members.map((member): TeamRow => ({ kind: "member", key: `m:${member.user_id}`, member })),
      ...data.invites.map((invite): TeamRow => ({ kind: "invite", key: `i:${invite.id}`, invite })),
    ]
  }, [teamQuery.data])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.team() })

  const changeRole = useMutation({
    mutationFn: async ({ row, role }: { row: TeamRow; role: AdminRole }) => {
      const { error } =
        row.kind === "member"
          ? await supabase.from("admin_members").update({ role }).eq("user_id", row.member.user_id)
          : await supabase.from("admin_invites").update({ role }).eq("id", row.invite.id)
      if (error) throw error
      return role
    },
    onSuccess: async (role) => {
      await invalidate()
      toast.success(`Role changed to ${ROLE_LABEL[role].toLowerCase()}`)
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn’t change the role. Try again.")),
  })

  const remove = useMutation({
    mutationFn: async (row: TeamRow) => {
      const { error } =
        row.kind === "member"
          ? await supabase.from("admin_members").delete().eq("user_id", row.member.user_id)
          : await supabase.from("admin_invites").update({ revoked_at: new Date().toISOString() }).eq("id", row.invite.id)
      if (error) throw error
      return row
    },
    onSuccess: async (row) => {
      await invalidate()
      setPendingRemoval(null)
      toast.success(row.kind === "member" ? "Member removed" : "Invite cancelled")
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn’t remove. Try again.")),
  })

  const resend = useMutation({
    mutationFn: (invite: InviteRow) => sendInviteEmailFor(invite.id).then(() => invite.email),
    onSuccess: (email) => toast.success(`Invite sent again to ${email}`),
    onError: (error) => toast.error(errorMessage(error, "Couldn’t send the invite email. Try again.")),
  })

  const removalName =
    pendingRemoval?.kind === "member"
      ? pendingRemoval.member.name || pendingRemoval.member.email
      : pendingRemoval?.kind === "invite"
        ? pendingRemoval.invite.email
        : ""

  return (
    <SettingsSection
      title="Team"
      description="Who can sign in to the admin, and what they can do. Everyone signs in with an email code and an authenticator app."
      action={
        canManageTeam ? (
          <Button type="button" variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden />
            Invite member
          </Button>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Only an owner can change the team.
          </p>
        )
      }
    >
      <div className="-mx-6 border-y border-border/60">
        {teamQuery.data === undefined && !teamQuery.isError ? (
          <SimpleTableSkeleton columns={COLUMNS} rows={3} label="Loading team" />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title={teamQuery.isError ? "The team didn’t load" : "No members yet"}
            message={teamQuery.isError ? "Check your connection and try again." : undefined}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[220px] pl-6">Member</TableHead>
                <TableHead className="w-[160px]">Role</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead className="w-[110px]">Added</TableHead>
                <TableHead className="w-[200px] pr-6">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isMember = row.kind === "member"
                const email = isMember ? row.member.email : row.invite.email
                const name = isMember ? row.member.name : row.invite.name
                const role = isMember ? row.member.role : row.invite.role
                const isSelf = isMember && row.member.user_id === user?.id
                return (
                  <TableRow key={row.key} className="h-14 hover:bg-transparent">
                    <TableCell className="max-w-0 pl-6">
                      <p className="truncate text-sm font-medium text-foreground">
                        {name || email}
                        {isSelf ? <span className="font-normal text-muted-foreground"> (you)</span> : null}
                      </p>
                      {name ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
                    </TableCell>
                    <TableCell>
                      {canManageTeam && role !== "owner" ? (
                        <RoleSelect
                          value={role}
                          label={`Role for ${name || email}`}
                          disabled={changeRole.isPending}
                          onChange={(next) => next !== role && changeRole.mutate({ row, role: next })}
                        />
                      ) : (
                        <span className="text-sm text-foreground">{ROLE_LABEL[role]}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={isMember ? "active" : "invited"} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">
                      {formatListDate(isMember ? row.member.created_at : row.invite.created_at)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {canManageTeam && !isSelf ? (
                        <div className="flex justify-end gap-1">
                          {row.kind === "invite" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="whitespace-nowrap"
                              disabled={resend.isPending}
                              onClick={() => resend.mutate(row.invite)}
                            >
                              Resend
                            </Button>
                          ) : null}
                          <Button type="button" variant="ghost" size="sm" className="whitespace-nowrap" onClick={() => setPendingRemoval(row)}>
                            {isMember ? "Remove" : "Cancel invite"}
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        title={pendingRemoval?.kind === "invite" ? `Cancel the invite for ${removalName}?` : `Remove ${removalName}?`}
        description={
          pendingRemoval?.kind === "invite"
            ? "They won’t be able to sign in with this email."
            : "They lose access to the admin at once. Their posts stay."
        }
        confirmLabel={pendingRemoval?.kind === "invite" ? "Cancel invite" : "Remove member"}
        cancelLabel="Keep"
        tone="destructive"
        pending={remove.isPending}
        onConfirm={() => {
          if (pendingRemoval) remove.mutate(pendingRemoval)
        }}
      />
    </SettingsSection>
  )
}

const TAB_VALUES = settingsTabs.map((tab) => tab.value)
const TABS = settingsTabs.map(({ value, label }) => ({ value, label }))
const tabFromUrl = (raw: string | null): SettingsTab => (TAB_VALUES.includes(raw as SettingsTab) ? (raw as SettingsTab) : "team")

/** Header and tabs paint before the address is read, so nothing jumps. */
function SettingsChrome({ tab = "team", onChange }: { tab?: SettingsTab; onChange?: (tab: SettingsTab) => void }) {
  return (
    <>
      <PageHeader title="Settings" description="Your team, redirects, media and categories." />
      <div className="overflow-x-auto">
        <FilterTabs<SettingsTab>
          ariaLabel="Settings sections"
          tabs={TABS}
          value={tab}
          onChange={(value) => onChange?.(value)}
          className="min-w-max"
        />
      </div>
    </>
  )
}

function TabPane({ active, label, children }: { active: boolean; label: string; children: ReactNode }) {
  return (
    <div role="tabpanel" hidden={!active} aria-label={label}>
      {children}
    </div>
  )
}

/** Like Office's Settings: one page, the tab in `?tab=`, a tab you have opened stays loaded, and a click needs no new page. */
function SettingsPageInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fromUrl = tabFromUrl(searchParams.get("tab"))
  const [tab, setTab] = useState<SettingsTab>(fromUrl)
  const [visited, setVisited] = useState<ReadonlySet<SettingsTab>>(() => new Set([fromUrl]))

  // A link or the browser's Back button changed the address: follow it (state adjusted during render, not in an effect).
  const [urlTab, setUrlTab] = useState<SettingsTab>(fromUrl)
  if (fromUrl !== urlTab) {
    setUrlTab(fromUrl)
    setTab(fromUrl)
    setVisited((current) => (current.has(fromUrl) ? current : new Set([...current, fromUrl])))
  }

  // The click shows the tab at once; the address follows without a Back step per tab.
  const show = (next: SettingsTab) => {
    if (next === tab) return
    setTab(next)
    setVisited((current) => (current.has(next) ? current : new Set([...current, next])))
    window.history.replaceState(null, "", next === "team" ? pathname : `${pathname}?tab=${next}`)
  }

  return (
    <div className="space-y-6">
      <SettingsChrome tab={tab} onChange={show} />
      <TabPane active={tab === "team"} label="Team">
        <TeamSection />
      </TabPane>
      {visited.has("redirects") ? (
        <TabPane active={tab === "redirects"} label="Redirects">
          <RedirectsTab />
        </TabPane>
      ) : null}
      {visited.has("media") ? (
        <TabPane active={tab === "media"} label="Media">
          <MediaTab />
        </TabPane>
      ) : null}
      {visited.has("categories") ? (
        <TabPane active={tab === "categories"} label="Categories">
          <CategoriesTab />
        </TabPane>
      ) : null}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <SettingsChrome />
        </div>
      }
    >
      <SettingsPageInner />
    </Suspense>
  )
}
