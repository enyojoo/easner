/**
 * Server-side code highlighting for WebProse code blocks: three colours, like the design card (accent for keywords
 * and commands, amber for strings and numbers, a dimmed tone for comments). No client JS and no dependency.
 */

export type TokenKind = "kw" | "str" | "com" | "plain"
export interface Token {
  text: string
  kind: TokenKind
}

const HASH_COMMENT = new Set(["bash", "sh", "shell", "zsh", "python", "py", "yaml", "yml", "ruby", "rb", "toml", "env"])
const DASH_COMMENT = new Set(["sql"])
const NO_COMMENT = new Set(["json", "text", "txt", "plain"])

const KEYWORDS = new Set(
  (
    "const let var function return if else for while do switch case break continue import export from default async await class extends new this try catch finally throw typeof instanceof of in as interface type enum implements public private static void " +
    "def lambda pass with yield elif except raise None True False and or not is " +
    "true false null undefined " +
    "select insert update delete create table where join group order by limit values into " +
    "curl npm npx git cd ls cat echo export sudo pip node docker wget"
  ).split(" "),
)

export function highlight(code: string, language?: string): Token[] {
  const lang = (language ?? "").toLowerCase()
  const hash = HASH_COMMENT.has(lang)
  const dash = DASH_COMMENT.has(lang)
  const slash = !hash && !dash && !NO_COMMENT.has(lang)
  const tokens: Token[] = []
  const push = (text: string, kind: TokenKind) => {
    if (!text) return
    const last = tokens[tokens.length - 1]
    if (last && last.kind === kind) last.text += text
    else tokens.push({ text, kind })
  }

  let i = 0
  while (i < code.length) {
    const rest = code.slice(i)
    const ch = code[i]
    if ((hash && ch === "#" && (i === 0 || /\s/.test(code[i - 1]))) || (dash && rest.startsWith("--")) || (slash && rest.startsWith("//"))) {
      const end = code.indexOf("\n", i)
      const stop = end === -1 ? code.length : end
      push(code.slice(i, stop), "com")
      i = stop
    } else if (slash && rest.startsWith("/*")) {
      const end = code.indexOf("*/", i + 2)
      const stop = end === -1 ? code.length : end + 2
      push(code.slice(i, stop), "com")
      i = stop
    } else if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1
      while (j < code.length && code[j] !== ch && !(code[j] === "\n" && ch !== "`")) j += code[j] === "\\" ? 2 : 1
      const stop = Math.min(j + 1, code.length)
      push(code.slice(i, stop), "str")
      i = stop
    } else if (/[0-9]/.test(ch) && (i === 0 || !/[A-Za-z_]/.test(code[i - 1]))) {
      const match = /^[0-9][0-9_.]*/.exec(rest)!
      push(match[0], "str")
      i += match[0].length
    } else if (/[A-Za-z_]/.test(ch)) {
      const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest)!
      push(match[0], KEYWORDS.has(match[0]) ? "kw" : "plain")
      i += match[0].length
    } else {
      push(ch, "plain")
      i += 1
    }
  }
  return tokens
}
