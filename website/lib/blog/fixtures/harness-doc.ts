import "server-only"
import { readFileSync } from "node:fs"
import type { DocNode } from "@easner/blog-content"
import { FIXTURE_POSTS } from "./data"
import type { BlogPost } from "../types"

/**
 * Development only: `BLOG_FIXTURE_DOC=/path/to/doc.json` with `BLOG_FIXTURES=1` serves that document as
 * /blog/harness-document, so what the admin's dev harness published can be rendered by the real website renderer
 * (admin/scripts/e2e-editor-renderer.mjs). The file is read on every request. Never active in a production build.
 */
export function harnessDocumentPost(slug: string): BlogPost | null {
  const file = process.env.BLOG_FIXTURE_DOC
  if (process.env.NODE_ENV !== "development" || !file || slug !== "harness-document") return null
  const content = JSON.parse(readFileSync(file, "utf8")) as DocNode
  return { ...FIXTURE_POSTS[0], id: "p-harness-document", slug, title: "Harness document", content, contentText: "", noindex: true }
}
