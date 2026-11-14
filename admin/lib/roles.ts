export type AdminRole = "owner" | "editor" | "writer"

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  editor: "Editor",
  writer: "Writer",
}

export const ROLE_DESCRIPTION: Record<AdminRole, string> = {
  owner: "Everything an editor can do, plus the team and settings.",
  editor: "Publishes any post and manages categories, authors, media and redirects.",
  writer: "Writes their own drafts and submits them for review.",
}

export function isAdminRole(value: unknown): value is AdminRole {
  return value === "owner" || value === "editor" || value === "writer"
}

/** What a role may do in the UI. The database enforces the same rules (RLS); this only hides what would fail. */
export function permissionsFor(role: AdminRole | null) {
  const editor = role === "owner" || role === "editor"
  return {
    canPublish: editor,
    canManageCategories: editor,
    canManageAuthors: editor,
    canManageRedirects: editor,
    canDeletePosts: editor,
    canManageTeam: role === "owner",
  }
}
