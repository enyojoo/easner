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

const H2 = 'font-display text-2xl font-bold text-web-ink mb-4'
const H3 = 'text-lg font-semibold text-web-ink mb-2'
const H1_IN_BODY = 'font-display text-3xl font-bold text-web-ink mb-4 mt-8'
const P_LAST = 'text-web-body leading-relaxed'
const P_MID = 'text-web-body leading-relaxed mb-4'
const UL = 'list-disc pl-6 space-y-2 text-web-body mb-4'
const OL = 'list-decimal pl-6 space-y-2 text-web-body mb-4'

function jsxText(text) {
  if (!text) return ""
  if (/[{}<>&]/.test(text)) {
    return `{${JSON.stringify(text)}}`
  }
  return text
}

/** Markdown [label](href) — capture link text without brackets when nested brackets exist */
const MD_LINK = /\[((?:\[[^\]]*\]|[^\]])+)\]\(([^)]+)\)/g

function tokenizeInline(text) {
  const pattern =
    /(\*\*\[(?:\[[^\]]*\]|[^\]])+\]\([^)]+\)\*\*|\*\*(?:Privacy Policy|KYC\/KYB and AML Policy|Terms of Service|Delete Account)\*\*|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|legal@easner\.com|support@easner\.com)/g
  const tokens = []
  let last = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: text.slice(last, match.index) })
    }
    const raw = match[0]
    const boldLink = /^\*\*\[((?:\[[^\]]*\]|[^\]])+)\]\(([^)]+)\)\*\*$/.exec(raw)
    if (boldLink) {
      tokens.push({ type: "link", label: boldLink[1], href: boldLink[2], wrapStrong: true })
    } else if (raw === "**Privacy Policy**") {
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
      let linkMatch
      MD_LINK.lastIndex = 0
      linkMatch = MD_LINK.exec(raw)
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
        case "link": {
          const inner =
            token.href.startsWith("/") || token.href.startsWith("mailto:") || token.href.startsWith("#")
              ? `<PolicyLink href="${token.href}">${jsxText(token.label)}</PolicyLink>`
              : `<PolicyExternalLink href="${token.href}" analyticsLocation="legal_external_link">${jsxText(token.label)}</PolicyExternalLink>`
          return token.wrapStrong ? `<strong>${inner}</strong>` : inner
        }
        case "email":
          return `<PolicyLink href="mailto:${token.value}" analyticsLocation="legal_inline_email">${token.value}</PolicyLink>`
        default:
          return ""
      }
    })
    .join("")
}

function paragraphJsx(text, className) {
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

function tableCellJsx(cell) {
  return inlineToJsx(cell)
}

function tableJsx(table) {
  const headerCells = table.headers.map(
    (h) => `              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">\n                ${tableCellJsx(h)}\n              </th>`,
  )
  const bodyRows = table.dataRows.map((row) => {
    const cells = row.map(
      (cell) => `                <td className="px-4 py-3 align-top">\n                  ${tableCellJsx(cell)}\n                </td>`,
    )
    return `            <tr className="border-b border-web-hairline last:border-b-0">\n${cells.join("\n")}\n            </tr>`
  })
  return `        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
${headerCells.join("\n")}
              </tr>
            </thead>
            <tbody>
${bodyRows.join("\n")}
            </tbody>
          </table>
        </div>`
}

/**
 * @param {string} md
 * @param {{ stopBeforeSection?: string | null, stripFirstTitle?: boolean }} [options]
 */
function parseMarkdown(md, options = {}) {
  const { stopBeforeSection = null, stripFirstTitle = true } = options
  const lines = md.split("\n")
  let title = ""
  let lastUpdated = "August 12, 2026"
  const sections = []
  /** @type {{ title: string | null, blocks: any[], anchorId?: string } | null} */
  let current = null
  let pendingSectionAnchorId = null
  let i = 0

  if (lines[0]?.startsWith("# ")) {
    title = lines[0].slice(2).trim()
    i = stripFirstTitle ? 1 : 0
  }

  const dateMatch = md.match(/Last updated:\s*(.+)/i)
  if (dateMatch) lastUpdated = dateMatch[1].trim()

  function ensureSection() {
    if (!current) {
      current = { title: null, blocks: [] }
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    const anchorMatch = /^<a\s+id="([^"]+)"\s*><\/a>\s*$/.exec(line.trim())
    if (anchorMatch) {
      pendingSectionAnchorId = anchorMatch[1]
      i++
      continue
    }

    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim()
      if (stopBeforeSection && heading.startsWith(stopBeforeSection)) break
      if (current) sections.push(current)
      current = { title: heading, blocks: [], anchorId: pendingSectionAnchorId ?? undefined }
      pendingSectionAnchorId = null
      i++
      continue
    }

    if (line.startsWith("### ")) {
      ensureSection()
      current.blocks.push({ type: "h3", text: line.slice(4).trim() })
      i++
      continue
    }

    if (line.startsWith("# ") && !line.startsWith("## ")) {
      ensureSection()
      current.blocks.push({ type: "h1", text: line.slice(2).trim() })
      i++
      continue
    }

    if (line.trim() === "---") {
      i++
      continue
    }

    if (!current) {
      if (line.trim()) {
        current = { title: null, blocks: [] }
      } else {
        i++
        continue
      }
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

    if (/^\s*-\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*-\s/.test(lines[i])) {
        const rawLine = lines[i]
        const indent = rawLine.length - rawLine.trimStart().length
        const m = /^(\s*)-\s(.+)$/.exec(rawLine)
        if (!m) break
        const text = m[2]
        if (indent === 0) {
          items.push({ text, nested: [] })
        } else if (items.length > 0) {
          items[items.length - 1].nested.push(text)
        } else {
          items.push({ text, nested: [] })
        }
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

    if (/^Last updated:\s*.+/i.test(line.trim())) {
      i++
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
        !/^<a\s+id="/.test(lines[i].trim())
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
  return trimmed.startsWith("**Easner Group, Inc.**") && trimmed.includes("584 Castro St")
}

function renderBlocks(blocks, { demoteH1ToH2 = false } = {}) {
  const rendered = []
  let index = 0
  let h1Seen = false

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
    const paraClass = isLast ? P_LAST : P_MID

    switch (block.type) {
      case "h1": {
        const useH2 = demoteH1ToH2 && !h1Seen
        h1Seen = true
        const Tag = useH2 ? "h2" : "h1"
        rendered.push(`        <${Tag} className="${H1_IN_BODY}">${inlineToJsx(block.text)}</${Tag}>`)
        break
      }
      case "h3":
        rendered.push(`        <h3 className="${H3}">${inlineToJsx(block.text)}</h3>`)
        break
      case "p":
        rendered.push(paragraphJsx(block.text, paraClass))
        break
      case "ul":
        rendered.push(`        <ul className="${UL}">
${block.items
  .map((item) => {
    const text = typeof item === "string" ? item : item.text
    const nested = typeof item === "object" && item.nested?.length
      ? `\n            <ul className="mt-2 list-disc space-y-2 pl-6">
${item.nested.map((sub) => `              <li>${inlineToJsx(sub)}</li>`).join("\n")}
            </ul>`
      : ""
    return `          <li>${inlineToJsx(text)}${nested}</li>`
  })
  .join("\n")}
        </ul>`)
        break
      case "ol":
        rendered.push(`        <ol className="${OL}">
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

function collectUsesPolicyExternalLink(content) {
  return content.includes("<PolicyExternalLink")
}

/**
 * @param {{ title: string | null, blocks: any[], anchorId?: string }} section
 */
function renderSectionWrapper(section, blockOptions = {}) {
  const inner = renderBlocks(section.blocks, blockOptions)
  if (section.title === null) {
    const idAttr = section.anchorId ? ` id="${section.anchorId}"` : ""
    return `      <section${idAttr}>
${inner}
      </section>`
  }
  const idAttr = section.anchorId ? ` id="${section.anchorId}"` : ""
  return `      <section${idAttr}>
        <h2 className="${H2}">${section.title}</h2>
${inner}
      </section>`
}

function renderPolicyComponent(exportName, parsed, extraImports = "", extraSections = "", options = {}) {
  const { shellTitle = null, shellLastUpdated = null, demoteBodyH1ToH2 = false } = options
  const displayTitle = shellTitle ?? parsed.title
  const displayLast = shellLastUpdated ?? parsed.lastUpdated

  const blockOpts = { demoteH1ToH2: demoteBodyH1ToH2 }
  const sectionsJsx = parsed.sections.map((s) => renderSectionWrapper(s, blockOpts)).join("\n\n")

  const body = `${sectionsJsx}${extraSections ? `\n${extraSections}` : ""}`
  const imports = ["PolicyPageShell"]
  if (body.includes("<PolicyContactBlock")) imports.unshift("PolicyContactBlock")
  if (collectUsesPolicyLink(body)) imports.push("PolicyLink")
  if (collectUsesPolicyExternalLink(body)) imports.push("PolicyExternalLink")

  return `${extraImports}import { ${imports.join(", ")} } from "@/components/legal/policy-page-shell"


export function ${exportName}() {
  return (
    <PolicyPageShell title="${displayTitle.replace(/"/g, '\\"')}" lastUpdated="${displayLast.replace(/"/g, '\\"')}">
${body}
    </PolicyPageShell>
  )
}
`
}

function renderLightsparkFullComponent(lightsparkMd) {
  const parsed = parseMarkdown(lightsparkMd)
  return renderPolicyComponent("LightsparkEutFullPage", parsed, "", "", { demoteBodyH1ToH2: true })
}

function renderTermsComponent(termsMd) {
  const parsed = parseMarkdown(termsMd, { stopBeforeSection: "20. Lightspark" })

  const s20Idx = termsMd.indexOf("## 20. Lightspark Grid End User Terms")
  let section20 = ""
  if (s20Idx !== -1) {
    const block20 = termsMd.slice(s20Idx)
    const nextH2 = block20.indexOf("\n## ", 1)
    const s20Only = nextH2 === -1 ? block20 : block20.slice(0, nextH2)
    const parsed20 = parseMarkdown(s20Only, { stripFirstTitle: false })
    const sec = parsed20.sections[0]
    const blocks = sec?.blocks ?? []
    section20 = `      <section id="lightspark-money-transmission">
        <h2 className="${H2}">20. Lightspark Grid End User Terms</h2>
${renderBlocks(blocks)}
      </section>`
  }

  return renderPolicyComponent("TermsPolicyPage", parsed, "", section20)
}

function main() {
  const complianceMd = fs.readFileSync(path.join(BANKING_LEGAL, "compliance.md"), "utf8")
  const privacyMd = fs.readFileSync(path.join(BANKING_LEGAL, "privacy-policy.md"), "utf8")
  const termsMd = fs.readFileSync(path.join(BANKING_LEGAL, "terms-of-service.md"), "utf8")
  const deleteAccountMd = fs.readFileSync(path.join(BANKING_LEGAL, "delete-account.md"), "utf8")
  const partnersMd = fs.readFileSync(path.join(BANKING_LEGAL, "partners.md"), "utf8")
  const lawMd = fs.readFileSync(path.join(BANKING_LEGAL, "law-enforcement-and-subpoenas.md"), "utf8")
  const indexMd = fs.readFileSync(path.join(BANKING_LEGAL, "index.md"), "utf8")
  const disclosurePersonalMd = fs.readFileSync(path.join(BANKING_LEGAL, "disclosures/personal-banking.md"), "utf8")
  const disclosureBusinessMd = fs.readFileSync(path.join(BANKING_LEGAL, "disclosures/business-banking.md"), "utf8")
  const disclosureDigitalMd = fs.readFileSync(path.join(BANKING_LEGAL, "disclosures/digital-assets.md"), "utf8")
  const lightsparkEutMd = fs.readFileSync(path.join(BANKING_LEGAL, "lightspark-eut.md"), "utf8")

  fs.mkdirSync(CONTENT_DIR, { recursive: true })
  fs.mkdirSync(path.join(CONTENT_DIR, "disclosures"), { recursive: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  fs.writeFileSync(path.join(CONTENT_DIR, "compliance.md"), complianceMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "privacy-policy.md"), privacyMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "terms-of-service.md"), termsMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "delete-account.md"), deleteAccountMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "partners.md"), partnersMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "law-enforcement-and-subpoenas.md"), lawMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "index.md"), indexMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "disclosures/personal-banking.md"), disclosurePersonalMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "disclosures/business-banking.md"), disclosureBusinessMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "disclosures/digital-assets.md"), disclosureDigitalMd)
  fs.writeFileSync(path.join(CONTENT_DIR, "lightspark-eut.md"), lightsparkEutMd)

  fs.writeFileSync(path.join(OUT_DIR, "compliance-content.tsx"), renderPolicyComponent("CompliancePolicyPage", parseMarkdown(complianceMd)))
  fs.writeFileSync(path.join(OUT_DIR, "privacy-content.tsx"), renderPolicyComponent("PrivacyPolicyPage", parseMarkdown(privacyMd)))
  fs.writeFileSync(path.join(OUT_DIR, "delete-account-content.tsx"), renderPolicyComponent("DeleteAccountPage", parseMarkdown(deleteAccountMd)))
  fs.writeFileSync(path.join(OUT_DIR, "partners-content.tsx"), renderPolicyComponent("PartnersPolicyPage", parseMarkdown(partnersMd)))
  fs.writeFileSync(path.join(OUT_DIR, "law-enforcement-content.tsx"), renderPolicyComponent("LawEnforcementPage", parseMarkdown(lawMd)))

  const indexParsed = parseMarkdown(indexMd)
  const legalHubLast =
    indexMd.match(/Last updated:\s*(.+)/i)?.[1]?.trim() ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  fs.writeFileSync(
    path.join(OUT_DIR, "legal-index-content.tsx"),
    renderPolicyComponent("LegalHubPage", indexParsed, "", "", { shellTitle: "Legal", shellLastUpdated: legalHubLast }),
  )

  fs.writeFileSync(
    path.join(OUT_DIR, "disclosure-personal-banking-content.tsx"),
    renderPolicyComponent("PersonalBankingDisclosurePage", parseMarkdown(disclosurePersonalMd)),
  )
  fs.writeFileSync(
    path.join(OUT_DIR, "disclosure-business-banking-content.tsx"),
    renderPolicyComponent("BusinessBankingDisclosurePage", parseMarkdown(disclosureBusinessMd)),
  )
  fs.writeFileSync(
    path.join(OUT_DIR, "disclosure-digital-assets-content.tsx"),
    renderPolicyComponent("DigitalAssetsDisclosurePage", parseMarkdown(disclosureDigitalMd)),
  )

  fs.writeFileSync(path.join(OUT_DIR, "lightspark-eut-content.tsx"), renderLightsparkFullComponent(lightsparkEutMd))

  fs.writeFileSync(path.join(OUT_DIR, "terms-content.tsx"), renderTermsComponent(termsMd))

  console.log("Synced legal content from easnerbanking/docs/legal")
}

main()
