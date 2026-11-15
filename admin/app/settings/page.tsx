"use client"

import { Suspense, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Lock, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { SimpleTableSkeleton } from "@/components/admin-skeletons"
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
import { FilterTabs } from "@/components/ui/filter-tabs"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsSection } from "@/components/ui/settings-section"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { adminKeys, errorMessage, formatListDate, useTeam, type InviteRow, type MemberRow } from "@/lib/queries"
import { permissionsFor, ROLE_DESCRIPTION, ROLE_LABEL, type AdminRole } from "@/lib/roles"
import { supabase } from "@/lib/supabase"

const ROLES: AdminRole[] = ["owner", "editor", "writer"]
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
      const { error } = await supabase
        .from("admin_invites")
        .insert({ email: normalized, name: name.trim(), role, invited_by: user?.id })
      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.team() })
      toast.success(`${normalized} can now sign in as ${ROLE_LABEL[role].toLowerCase()}`)
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
                <TableHead className="w-[140px] pr-6">
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
                      {canManageTeam ? (
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
                        <Button type="button" variant="ghost" size="sm" className="whitespace-nowrap" onClick={() => setPendingRemoval(row)}>
                          {isMember ? "Remove" : "Cancel invite"}
                        </Button>
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

function SettingsPageInner() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="The admin’s team and roles." />
      <FilterTabs ariaLabel="Settings sections" tabs={[{ value: "team", label: "Team" }]} value="team" onChange={() => {}} />
      <TeamSection />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageInner />
    </Suspense>
  )
}
