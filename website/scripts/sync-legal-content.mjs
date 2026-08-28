#!/usr/bin/env node
/**
 * Sync legal policy TSX components from easnerbanking markdown sources.
 * Usage: node scripts/sync-legal-content.mjs
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEBSITE_ROOT = path.resolve(__dirname, "..")
const BANKING_LEGAL = path.resolve(WEBSITE_ROOT, "../../easnerbanking/docs/legal")
const OUT_DIR = path.resolve(WEBSITE_ROOT, "components/legal")
const CONTENT_DIR = path.resolve(WEBSITE_ROOT, "content/legal")

const POLICY_LINKS = {
  "Privacy Policy": "/privacy",
  "KYC/KYB and AML Policy": "/compliance",
  "Terms of Service": "/terms",
  "Delete Account": "/delete-account",
}

function jsxText(text) {
  if (!text) return ""
  if (/[{}<>&]/.test(text)) {
    return `{${JSON.stringify(text)}}`
  }
  return text
}

function tokenizeInline(text) {
  const pattern =
    /(\*\*(?:Privacy Policy|KYC\/KYB and AML Policy|Terms of Service|Delete Account)\*\*|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|legal@easner\.com|support@easner\.com)/g
  const tokens = []
  let last = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: text.slice(last, match.index) })
    }
    const raw = match[0]
    if (raw === "**Privacy Policy**") {
      tokens.push({ type: "policy", label: "Privacy Policy", href: "/privacy" })
    } else if (raw === "**KYC/KYB and AML Policy**") {
      tokens.push({ type: "policy", label: "KYC/KYB and AML Policy", href: "/compliance" })
    } else if (raw === "**Terms of Service**") {
      tokens.push({ type: "policy", label: "Terms of Service", href: "/terms" })
    } else if (raw === "**Delete Account**") {
      tokens.push({ type: "policy", label: "Delete Account", href: "/delete-account" })
    } else if (raw.startsWith("**")) {
      tokens.push({ type: "bold", value: raw.slice(2, -2) })
    } else if (raw.startsWith("[")) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(raw)
      tokens.push({ type: "link", label: linkMatch[1], href: linkMatch[2] })
    } else if (raw.includes("@easner.com")) {
      tokens.push({ type: "email", value: raw })
    }
    last = match.index + raw.length
  }

  if (last < text.length) {
    tokens.push({ type: "text", value: text.slice(last) })
  }

  return tokens.length ? tokens : [{ type: "text", value: text }]
}

function inlineToJsx(text) {
  return tokenizeInline(text)
    .map((token) => {
      switch (token.type) {
        case "text":
          return jsxText(token.value)
        case "bold":
          return `<strong>${jsxText(token.value)}</strong>`
        case "policy":
          return `<PolicyLink href="${token.href}">${jsxText(token.label)}</PolicyLink>`
        case "link":
          if (token.href.startsWith("/")) {
            return `<PolicyLink href="${token.href}">${jsxText(token.label)}</PolicyLink>`
          }
          return `<a href="${token.href}" className="font-semibold text-[#007ACC] hover:underline" target="_blank" rel="noopener noreferrer">${jsxText(token.label)}</a>`
        case "email":
          return `<a href="mailto:${token.value}" className="font-semibold text-[#007ACC] hover:underline">${token.value}</a>`
        default:
          return ""
      }
    })
    .join("")
}

function inlineToHtml(text) {
  return tokenizeInline(text)
    .map((token) => {
      switch (token.type) {
        case "text":
          return token.value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
        case "bold":
          return `<strong>${token.value}</strong>`
        case "policy":
        case "link":
          if (token.type === "link" && !token.href.startsWith("/")) {
            return `<a href="${token.href}" target="_blank" rel="noopener noreferrer">${token.label}</a>`
          }
          return token.label
        case "email":
          return `<a href="mailto:${token.value}">${token.value}</a>`
        default:
          return ""
      }
    })
    .join("")
}

function paragraphJsx(text, className = "text-[#5F665F] leading-relaxed mb-4") {
  const trimmed = text.trim()
  if (!trimmed) return ""
  return `        <p className="${className}">\n          ${inlineToJsx(trimmed)}\n        </p>`
}

function parseTable(lines) {
  const rows = lines.filter((l) => l.trim().startsWith("|"))
  if (rows.length < 2) return null
  const parseRow = (line) => line.split("|").slice(1, -1).map((c) => c.trim())
  return { headers: parseRow(rows[0]), dataRows: rows.slice(2).map(parseRow) }
}

function tableJsx(table) {
  const rowsStr = table.dataRows
    .map((row) => `            [${row.map((c) => JSON.stringify(c)).join(", ")}]`)
    .join(",\n")
  return `        <PolicyTable
          headers={[${table.headers.map((h) => JSON.stringify(h)).join(", ")}]}
          rows={[
${rowsStr}
          ]}
        />`
}

function parseMarkdown(md, options = {}) {
  const { stopAtSection = null } = options
  const lines = md.split("\n")
  let title = ""
  let lastUpdated = "August 12, 2026"
  const sections = []
  let current = null
  let i = 0

  if (lines[0]?.startsWith("# ")) {
    title = lines[0].slice(2).trim()
    i = 1
  }

  const dateMatch = md.match(/Last updated:\s*(.+)/i)
  if (dateMatch) lastUpdated = dateMatch[1].trim()

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("<a id=")) {
      i++
      continue
    }

    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim()
      if (stopAtSection && heading.startsWith(stopAtSection)) break
      if (current) sections.push(current)
      current = { title: heading, blocks: [] }
      i++
      continue
    }

    if (!current) {
      i++
      continue
    }

    if (line.startsWith("### ")) {
      current.blocks.push({ type: "h3", text: line.slice(4).trim() })
      i++
      continue
    }

    if (line.startsWith("# ")) {
      current.blocks.push({ type: "h1", text: line.slice(2).trim() })
      i++
      continue
    }

    if (line.trim() === "---") {
      i++
      continue
    }

    if (line.trim().startsWith("|")) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i])
        i++
      }
      const table = parseTable(tableLines)
      if (table) current.blocks.push({ type: "table", table })
      continue
    }

    if (line.trim().startsWith("- ")) {
      const items = []
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      current.blocks.push({ type: "ul", items })
      continue
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const items = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""))
        i++
      }
      current.blocks.push({ type: "ol", items })
      continue
    }

    if (line.trim()) {
      const paraLines = [line.trim()]
      i++
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].startsWith("#") &&
        !lines[i].trim().startsWith("- ") &&
        !lines[i].trim().startsWith("|") &&
        !/^\d+\.\s/.test(lines[i].trim()) &&
        !lines[i].startsWith("<a id=")
      ) {
        paraLines.push(lines[i].trim())
        i++
      }
      current.blocks.push({ type: "p", text: paraLines.join(" ") })
      continue
    }

    i++
  }

  if (current) sections.push(current)
  return { title, lastUpdated, sections }
}

function isEasnerContactParagraph(text) {
  const trimmed = text.trim()
  if (
    trimmed.startsWith("**Email (legal and compliance):**") ||
    trimmed.startsWith("**For Support:**") ||
    trimmed.startsWith("**Phone:**") ||
    trimmed.startsWith("**Website:**")
  ) {
    return true
  }

  // Contact header includes the mailing address; intro paragraphs only name the company.
  return trimmed.startsWith("**Easner Group, Inc.**") && trimmed.includes("584 Castro St")
}

function renderBlocks(blocks) {
  const rendered = []
  let index = 0

  while (index < blocks.length) {
    const block = blocks[index]

    if (block.type === "p" && isEasnerContactParagraph(block.text)) {
      rendered.push("        <PolicyContactBlock />")
      while (index < blocks.length && blocks[index].type === "p" && isEasnerContactParagraph(blocks[index].text)) {
        index++
      }
      continue
    }

    const isLast = index === blocks.length - 1
    const paraClass = isLast ? "text-[#5F665F] leading-relaxed" : "text-[#5F665F] leading-relaxed mb-4"

    switch (block.type) {
      case "h1":
        rendered.push(
          `        <h1 className="font-unbounded text-3xl font-bold text-[#0F1110] mb-4 mt-8">${block.text}</h1>`
        )
        break
      case "h3":
        rendered.push(
          `        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">${inlineToJsx(block.text)}</h3>`
        )
        break
      case "p":
        rendered.push(paragraphJsx(block.text, paraClass))
        break
      case "ul":
        rendered.push(`        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
${block.items.map((item) => `          <li>${inlineToJsx(item)}</li>`).join("\n")}
        </ul>`)
        break
      case "ol":
        rendered.push(`        <ol className="list-decimal pl-6 space-y-2 text-[#5F665F] mb-4">
${block.items.map((item) => `          <li>${inlineToJsx(item)}</li>`).join("\n")}
        </ol>`)
        break
      case "table":
        rendered.push(tableJsx(block.table))
        break
      default:
        break
    }

    index++
  }

  return rendered.filter(Boolean).join("\n")
}

function collectUsesPolicyLink(content) {
  return content.includes("<PolicyLink")
}

function renderPolicyComponent(exportName, parsed, extraImports = "", extraSections = "") {
  const sectionsJsx = parsed.sections
    .map(
      (section) => `      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">${section.title}</h2>
${renderBlocks(section.blocks)}
      </section>`
    )
    .join("\n\n")

  const body = `${sectionsJsx}\n${extraSections}`
  const imports = ["PolicyContactBlock", "PolicyPageShell"]
  if (collectUsesPolicyLink(body)) imports.splice(1, 0, "PolicyLink")
  if (body.includes("<PolicyTable")) imports.push("PolicyTable")

  return `${extraImports}import { ${imports.join(", ")} } from "@/components/legal/policy-page-shell"


export function ${exportName}() {
  return (
    <PolicyPageShell title="${parsed.title}" lastUpdated="${parsed.lastUpdated}">
${body}
    </PolicyPageShell>
  )
}
`
}

function extractLightsparkMarkdown(termsMd) {
  const marker = "## 20. Lightspark Grid End User Terms"
  const idx = termsMd.indexOf(marker)
  if (idx === -1) throw new Error("Lightspark section not found")
  const section = termsMd.slice(idx)
  const h1Idx = section.indexOf("\n# Lightspark Grid Transactions Terms of Service\n")
  if (h1Idx === -1) throw new Error("Lightspark body not found")
  return section.slice(h1Idx + 1).trim()
}

function renderLightsparkComponent(lightsparkMd) {
  const lines = lightsparkMd.split("\n")
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() })
      i++
      continue
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() })
      i++
      continue
    }

    if (line.trim() === "---") {
      i++
      continue
    }

    if (line.trim()) {
      const paraLines = [line.trim()]
      i++
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#")) {
        paraLines.push(lines[i].trim())
        i++
      }
      blocks.push({ type: "p", text: paraLines.join(" ") })
      continue
    }
    i++
  }

  const body = blocks
    .map((block) => {
      if (block.type === "h1") {
        return `      <h1 className="font-unbounded text-3xl font-bold text-[#0F1110] mb-4 mt-8">${block.text}</h1>`
      }
      if (block.type === "h2") {
        return `      <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">${block.text}</h2>`
      }
      const html = inlineToHtml(block.text)
      if (block.text.match(/^\d+\.\d+\s/)) {
        return `      <div className="space-y-3 text-[#5F665F] leading-relaxed mb-4">
        <p dangerouslySetInnerHTML={{ __html: ${JSON.stringify(html)} }} />
      </div>`
      }
      return `      <p className="text-[#5F665F] leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(html)} }} />`
    })
    .join("\n")

  return `export function LightsparkGridTermsContent() {
  return (
    <>
${body}
    </>
  )
}
`
}

function renderTermsComponent(termsMd) {
  const parsed = parseMarkdown(termsMd, { stopAtSection: "20. Lightspark" })

  const s20Idx = termsMd.indexOf("## 20. Lightspark Grid End User Terms")
  let section20 = ""
  if (s20Idx !== -1) {
    const introMd = termsMd.slice(s20Idx)
    const introEnd = introMd.indexOf("\n# Lightspark Grid Transactions Terms of Service\n")
    const introOnly = introEnd === -1 ? introMd : introMd.slice(0, introEnd)
    const introParsed = parseMarkdown(introOnly)
    const introSection = introParsed.sections[0]
    section20 = `      <section id="lightspark-money-transmission">
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">20. Lightspark Grid End User Terms</h2>
${renderBlocks(introSection?.blocks ?? [])}
        <div className="mt-8 border-t border-[#E4DED1] pt-8">
          <LightsparkGridTermsContent />
        </div>
      </section>`
  }

  const extraImport = 'import { LightsparkGridTermsContent } from "@/components/legal/lightspark-grid-terms-content"\n'
  return renderPolicyComponent("TermsPolicyPage", parsed, extraImport, section20)
}

function main() {
  const complianceMd = fs.readFileSync(path.join(BANKING_LEGAL, "compliance.md"), "utf8")
  const privacyMd = fs.readFileSync(path.join(BANKING_LEGAL, "privacy-policy.md"), "utf8")
  const termsMd = fs.readFileSync(path.join(BANKING_LEGAL, "terms-of-service.md"), "utf8")

  fs.mkdirSync(CONTENT_DIR, { recursive: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  fs.writeFileSync(path.join(CONTENT_DIR, "compliance.md"), complianceMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "privacy-policy.md"), privacyMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "terms-of-service.md"), termsMd)

  fs.writeFileSync(
    path.join(OUT_DIR, "compliance-content.tsx"),
    renderPolicyComponent("CompliancePolicyPage", parseMarkdown(complianceMd))
  )
  fs.writeFileSync(
    path.join(OUT_DIR, "privacy-content.tsx"),
    renderPolicyComponent("PrivacyPolicyPage", parseMarkdown(privacyMd))
  )

  const lightsparkMd = extractLightsparkMarkdown(termsMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "lightspark-grid-terms.md"), lightsparkMd)
  fs.writeFileSync(path.join(OUT_DIR, "lightspark-grid-terms-content.tsx"), renderLightsparkComponent(lightsparkMd))
  fs.writeFileSync(path.join(OUT_DIR, "terms-content.tsx"), renderTermsComponent(termsMd))

  console.log("Synced legal content from easnerbanking/docs/legal")
}

main()
