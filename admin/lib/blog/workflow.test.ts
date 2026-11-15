import { test } from "node:test"
import assert from "node:assert/strict"
import { workflow, type WorkflowInput } from "./workflow.ts"

type Over = Partial<Omit<WorkflowInput, "post">> & { post?: Partial<WorkflowInput["post"]> }
const base = (over: Over = {}): WorkflowInput => ({
  role: "editor",
  userId: "ed1",
  review: { have: 0 },
  ...over,
  post: { status: "draft", created_by: "w1", has_unpublished_changes: false, claims_flagged: false, ...over.post },
})

test("writer: submits their own draft, then waits; others' posts are read-only", () => {
  const own = workflow(base({ role: "writer", userId: "w1" }))
  assert.equal(own.canEdit, true)
  assert.equal(own.primary, "submit")
  const waiting = workflow(base({ role: "writer", userId: "w1", post: { status: "in_review" } }))
  assert.equal(waiting.canEdit, false)
  assert.deepEqual(waiting.secondary, ["withdraw"])
  const changes = workflow(base({ role: "writer", userId: "w1", post: { status: "changes_requested" } }))
  assert.equal(changes.primary, "submit")
  const other = workflow(base({ role: "writer", userId: "w2" }))
  assert.equal(other.canEdit, false)
  assert.equal(other.primary, null)
  const live = workflow(base({ role: "writer", userId: "w1", post: { status: "published" } }))
  assert.equal(live.canEdit, false)
})

test("editor: reviews, approves and publishes a writer's post", () => {
  const review = workflow(base({ post: { status: "in_review" } }))
  assert.equal(review.primary, "approve-publish")
  assert.deepEqual(review.secondary, ["request-changes", "delete"])
  assert.equal(workflow(base()).primary, "publish")
  assert.equal(workflow(base({ role: "owner", post: { created_by: "ed1" } })).primary, "publish")
})

test("flagged posts need two editors: the first only approves, the second publishes", () => {
  const first = workflow(base({ post: { status: "in_review", claims_flagged: true }, review: { have: 0 } }))
  assert.equal(first.primary, "approve")
  assert.equal(first.needsSecondEditor, true)
  const second = workflow(base({ post: { status: "in_review", claims_flagged: true }, review: { have: 1 } }))
  assert.equal(second.primary, "approve-publish")
  assert.equal(second.needsSecondEditor, false)
})

test("flagged: the author-editor can never publish; they send it for review", () => {
  const draft = workflow(base({ post: { created_by: "ed1", claims_flagged: true } }))
  assert.equal(draft.primary, "submit")
  const inReview = workflow(base({ post: { created_by: "ed1", status: "in_review", claims_flagged: true } }))
  assert.equal(inReview.primary, null)
  assert.match(inReview.note ?? "", /different Editor/)
  // A different editor counts the author as the first, so one approval is enough.
  const other = workflow(base({ post: { created_by: "ed2", status: "in_review", claims_flagged: true }, review: { have: 1 } }))
  assert.equal(other.primary, "approve-publish")
})

test("published posts: update only with draft changes; unpublish and archive are editor actions", () => {
  const clean = workflow(base({ post: { status: "published" } }))
  assert.equal(clean.primary, null)
  assert.deepEqual(clean.secondary, ["unpublish", "archive"])
  const edited = workflow(base({ post: { status: "published", has_unpublished_changes: true } }))
  assert.equal(edited.primary, "update")
  const flagged = workflow(base({ post: { status: "published", has_unpublished_changes: true, claims_flagged: true } }))
  assert.equal(flagged.primary, "approve")
})

test("archived is read-only with unarchive", () => {
  const archived = workflow(base({ post: { status: "archived" } }))
  assert.equal(archived.canEdit, false)
  assert.deepEqual(archived.secondary, ["unarchive", "delete"])
})

test("scheduled: not live, so publishing now stays available and the schedule can move or go", () => {
  const scheduled = workflow(base({ post: { status: "scheduled", has_unpublished_changes: true } }))
  assert.equal(scheduled.canEdit, true)
  assert.equal(scheduled.primary, "publish")
  assert.deepEqual(scheduled.secondary, ["reschedule", "unschedule", "archive", "delete"])
  const writer = workflow(base({ role: "writer", userId: "w1", post: { status: "scheduled" } }))
  assert.equal(writer.canEdit, false)
  assert.equal(writer.primary, null)
})
