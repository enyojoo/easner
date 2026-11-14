import {
  extractSummary,
  plainText,
  readingMinutes,
  validateDoc,
  withHeadingIds,
  wordCount,
  type DocNode,
  type ValidationIssue,
} from "@easner/blog-content"

export interface DerivedFields {
  contentText: string
  wordCount: number
  readingMinutes: number
  summary: string | null
}

export function deriveFields(doc: DocNode): DerivedFields {
  const words = wordCount(doc)
  return { contentText: plainText(doc), wordCount: words, readingMinutes: readingMinutes(words), summary: extractSummary(doc) }
}

export type PrepareSave =
  | { ok: true; doc: DocNode; derived: DerivedFields; warnings: ValidationIssue[] }
  | { ok: false; errors: ValidationIssue[] }

/** Validates a doc for saving. Errors block; heading ids are filled so anchors match the website. */
export function prepareSave({ doc }: { title?: string; excerpt?: string | null; doc: DocNode }): PrepareSave {
  const issues = validateDoc(doc)
  const errors = issues.filter((i) => i.severity === "error")
  if (errors.length) return { ok: false, errors }
  const withIds = withHeadingIds(doc)
  return { ok: true, doc: withIds, derived: deriveFields(withIds), warnings: issues.filter((i) => i.severity === "warning") }
}
