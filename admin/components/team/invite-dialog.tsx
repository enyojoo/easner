"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { sendInviteEmailFor } from "@/lib/blog/post-api"
import { adminKeys, errorMessage } from "@/lib/queries"
import { pageKeys } from "@/lib/queries-pages"
import { ROLE_DESCRIPTION, ROLE_LABEL, type AdminRole } from "@/lib/roles"
import { supabase } from "@/lib/supabase"

/** There is one owner (the person who set the site up). Everyone else is invited as an editor or a writer. */
export const INVITE_ROLES: AdminRole[] = ["editor", "writer"]
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/** Invite a team member by email. Owner only (the database enforces it). Used by Settings, Team and Authors. */
export function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.team() }),
        queryClient.invalidateQueries({ queryKey: pageKeys.authors() }),
      ])
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
                {INVITE_ROLES.map((option) => (
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
