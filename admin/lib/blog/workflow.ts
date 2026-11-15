/**
 * What the signed-in person can do with a post right now: the top bar's main action, the secondary actions, and
 * whether the canvas is editable. This mirrors the database rules (supabase/migrations/20261115120000) so the UI
 * only offers what would succeed; the database is still the authority.
 */
export type WorkflowRole = "owner" | "editor" | "writer"
export type WorkflowStatus = "draft" | "in_review" | "changes_requested" | "scheduled" | "published" | "archived"

export type PrimaryAction = "submit" | "publish" | "update" | "approve" | "approve-publish" | null
export type SecondaryAction = "request-changes" | "withdraw" | "unpublish" | "archive" | "unarchive" | "reschedule" | "unschedule"

export interface WorkflowInput {
  role: WorkflowRole
  userId: string
  post: {
    status: WorkflowStatus
    created_by: string
    has_unpublished_changes: boolean
    claims_flagged: boolean
  }
  /** From blog_post_review_state: distinct approving editors for this version, not counting the caller. */
  review: { have: number } | null
}

export interface WorkflowResult {
  canEdit: boolean
  primary: PrimaryAction
  secondary: SecondaryAction[]
  /** Why there is no main action, or a rule the person should know about. */
  note: string | null
  /** The post is flagged and still needs another Editor. */
  needsSecondEditor: boolean
}

const REQUIRED_EDITORS = 2

export function workflow({ role, userId, post, review }: WorkflowInput): WorkflowResult {
  const isEditor = role === "owner" || role === "editor"
  const isAuthor = post.created_by === userId
  const { status } = post

  if (!isEditor) {
    const own = isAuthor && (status === "draft" || status === "changes_requested")
    if (own) return { canEdit: true, primary: "submit", secondary: [], note: null, needsSecondEditor: false }
    if (isAuthor && status === "in_review") {
      return { canEdit: false, primary: null, secondary: ["withdraw"], note: "Waiting for an Editor to review it.", needsSecondEditor: false }
    }
    return { canEdit: false, primary: null, secondary: [], note: isAuthor ? null : "Writers edit their own drafts.", needsSecondEditor: false }
  }

  if (status === "archived") {
    return { canEdit: false, primary: null, secondary: ["unarchive"], note: "Archived posts are read-only.", needsSecondEditor: false }
  }

  // Scheduled is not live yet: the main action publishes now, and the schedule can move or go.
  if (status === "scheduled") {
    const flaggedScheduler = post.claims_flagged && isAuthor
    return {
      canEdit: true,
      primary: flaggedScheduler ? null : "publish",
      secondary: ["reschedule", "unschedule", "archive"],
      note: null,
      needsSecondEditor: false,
    }
  }

  const live = status === "published"
  // The author counts toward the two Editors when they are one, but can never be the one who publishes a flagged post.
  const have = (review?.have ?? 0) + 1
  const needsSecondEditor = post.claims_flagged && have < REQUIRED_EDITORS
  const flaggedAuthor = post.claims_flagged && isAuthor

  if (live) {
    const secondary: SecondaryAction[] = ["unpublish", "archive"]
    if (!post.has_unpublished_changes) return { canEdit: true, primary: null, secondary, note: null, needsSecondEditor: false }
    if (flaggedAuthor) {
      return { canEdit: true, primary: null, secondary, note: "This update makes claims. A different Editor has to approve and publish it.", needsSecondEditor: true }
    }
    return { canEdit: true, primary: needsSecondEditor ? "approve" : "update", secondary, note: null, needsSecondEditor }
  }

  if (status === "in_review") {
    const secondary: SecondaryAction[] = ["request-changes"]
    if (flaggedAuthor) {
      return { canEdit: true, primary: null, secondary, note: "This post makes claims. A different Editor has to approve and publish it.", needsSecondEditor: true }
    }
    return { canEdit: true, primary: needsSecondEditor ? "approve" : "approve-publish", secondary, note: null, needsSecondEditor }
  }

  // draft or changes_requested
  if (post.claims_flagged && (flaggedAuthor || needsSecondEditor)) {
    return {
      canEdit: true,
      primary: "submit",
      secondary: [],
      note: "This post makes claims about fees, rates or regulation. Send it for review: two Editors have to approve it.",
      needsSecondEditor: true,
    }
  }
  return { canEdit: true, primary: "publish", secondary: [], note: null, needsSecondEditor: false }
}

export const PRIMARY_LABEL: Record<Exclude<PrimaryAction, null>, string> = {
  submit: "Submit for review",
  publish: "Publish",
  update: "Update live post",
  approve: "Approve",
  "approve-publish": "Approve and publish",
}
