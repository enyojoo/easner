/**
 * Card (components/ui/card.tsx) pads only top and bottom. Text or a layout placed straight inside it touches the card's
 * edges (the Overview "no inner padding" bug). Every <Card> must either be `padding="none"`, carry its own `px-` class,
 * or start with CardHeader, CardContent, CardBody, CardFooter or a component. This reads the source, so it needs no browser.
 */
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const ROOT = new URL("..", import.meta.url).pathname
const SKIP = new Set(["node_modules", ".next", "ui"])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (path.endsWith(".tsx")) out.push(path)
  }
  return out
}

/** The text of an opening tag starting at `start` (handles `>` inside braces) and the index just after it. */
function openingTag(src: string, start: number): { tag: string; end: number } | null {
  let depth = 0
  for (let i = start; i < src.length; i++) {
    const c = src[i]
    if (c === "{") depth++
    else if (c === "}") depth--
    else if (c === ">" && depth === 0) return { tag: src.slice(start, i + 1), end: i + 1 }
  }
  return null
}

test("every <Card> has inner padding", () => {
  const offenders: string[] = []
  for (const file of [...walk(join(ROOT, "app")), ...walk(join(ROOT, "components"))]) {
    const src = readFileSync(file, "utf8")
    for (const match of src.matchAll(/<Card(?=[\s>])/g)) {
      const open = openingTag(src, match.index!)
      if (!open || open.tag.endsWith("/>")) continue
      if (/padding="none"/.test(open.tag) || /\bpx-\d|\bp-\d|\bpx-\[/.test(open.tag)) continue
      const next = /^\s*(?:\{\/\*[\s\S]*?\*\/\}\s*)*<([A-Za-z][\w.]*)/.exec(src.slice(open.end))
      const first = next?.[1] ?? ""
      if (/^[A-Z]/.test(first)) continue
      const line = src.slice(0, match.index).split("\n").length
      offenders.push(`${file.replace(ROOT, "")}:${line} first child is ${first ? `<${first}>` : "an expression or text"}`)
    }
  }
  assert.deepEqual(offenders, [], "Wrap the content in CardContent or CardBody, add px-6, or use padding=\"none\"")
})
