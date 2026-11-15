"use client"

/**
 * Client actions the posts list and the editor share. Each one acts as the signed-in person: the role-checked
 * functions in the database decide, and the route handlers tell the website afterwards (secrets stay on the server).
 */
import { supabaseAdapter, callBlogAction, duplicatePostRow, fetchPost, fetchPreviewLink } from "@/lib/blog/post-api"
import type { PostFull, WebsiteResult } from "@/components/editor/types"

export type { PostFull, WebsiteResult }

type WithWebsite = { post: PostFull; website: WebsiteResult }

async function withWebsite(postId: string, action: "unpublish" | "archive" | "unarchive"): Promise<WithWebsite> {
  const { website } = await callBlogAction(action, postId)
  const post = await fetchPost(postId)
  if (!post) throw new Error("That post couldn’t be found.")
  return { post, website }
}

export const publishPost = (postId: string, opts: { significant?: boolean } = {}) =>
  supabaseAdapter.publish(postId, { significant: opts.significant !== false })
export const unpublishPost = (postId: string) => withWebsite(postId, "unpublish")
export const archivePost = (postId: string) => withWebsite(postId, "archive")
export const unarchivePost = (postId: string) => withWebsite(postId, "unarchive")
export const deletePost = async (postId: string) => {
  await callBlogAction("delete", postId)
}
export const submitForReview = (postId: string) => supabaseAdapter.submitForReview(postId)
export const withdrawSubmission = (postId: string) => supabaseAdapter.withdraw(postId)
export const requestChanges = (postId: string, comment?: string) => supabaseAdapter.requestChanges(postId, comment ?? "")
export const approvePost = (postId: string) => supabaseAdapter.approve(postId)
export const getPreviewLink = (postId: string) => fetchPreviewLink(postId)
export const duplicatePost = (postId: string) => duplicatePostRow(postId)
