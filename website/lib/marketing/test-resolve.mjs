import { existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

function typedFile(base) {
  if (existsSync(`${base}.ts`)) return `${base}.ts`
  if (existsSync(`${base}.tsx`)) return `${base}.tsx`
  return `${base}.ts`
}

const empty = "data:text/javascript,export default {}"

export async function resolve(specifier, context, nextResolve) {
  const root = context.data?.root ?? new URL("../../", import.meta.url).href
  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !/\.(ts|js|mjs|json)$/.test(specifier)
  ) {
    return nextResolve(pathToFileURL(typedFile(fileURLToPath(new URL(specifier, context.parentURL)))).href, context)
  }
  if (specifier === "@easner/shared" || specifier.startsWith("@easner/shared/")) {
    return { url: new URL("./shared-stub.mjs", import.meta.url).href, shortCircuit: true }
  }
  if (specifier.endsWith(".png")) return { url: empty, shortCircuit: true }
  if (specifier.startsWith("@/")) {
    const rest = specifier.slice(2)
    if (rest.endsWith(".png")) return { url: empty, shortCircuit: true }
    const file = join(fileURLToPath(root), rest)
    const withExt = /\.(ts|tsx|js|mjs)$/.test(file) ? file : typedFile(file)
    return nextResolve(pathToFileURL(withExt).href, context)
  }
  return nextResolve(specifier, context)
}
