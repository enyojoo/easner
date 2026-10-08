"use client"

import type { ReactNode } from "react"
import { SupportChatTrigger } from "@/components/marketing/support-chat-trigger"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { trackLinkClick } from "@/lib/marketing/analytics"

export const POLICY_LAST_UPDATED = "August 12, 2026"

export function PolicyLink({
  href,
  children,
  analyticsLocation,
}: {
  href: string
  children: ReactNode
  analyticsLocation?: string
}) {
  const resolvedLocation = analyticsLocation ?? `legal_link_${href.replace(/^\//, "") || "home"}`

  return (
    <MarketingLink href={href} analyticsLocation={resolvedLocation} className="font-semibold text-brand-primary hover:underline">
      {children}
    </MarketingLink>
  )
}

export function PolicyPageShell({
  title,
  lastUpdated = POLICY_LAST_UPDATED,
  children,
}: {
  title: string
  lastUpdated?: string
  children: React.ReactNode
}) {
  return (
    <section className="pb-16 pt-10 md:pb-24 md:pt-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-[1.75rem] border border-web-hairline bg-white/90 shadow-panel">
          <header className="border-b border-web-hairline px-6 py-8 sm:px-10">
            <h1 className="font-display text-3xl font-bold leading-tight text-web-ink sm:text-4xl">
              {title}
            </h1>
          </header>
          <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">{children}</div>
          <footer className="border-t border-web-hairline px-6 py-6 sm:px-10">
            <p className="text-sm text-web-meta">Last updated: {lastUpdated}</p>
          </footer>
        </article>
      </div>
    </section>
  )
}

export function PolicyContactBlock() {
  return (
    <div className="mt-4 rounded-[16px] border border-web-hairline bg-web-plate p-5 text-sm leading-7 text-web-body sm:text-base">
      <p>
        <strong className="text-web-ink">Easner Group, Inc.</strong>
        <br />
        584 Castro St, Suite 4092
        <br />
        San Francisco, CA 94114, United States
        <br />
        <br />
        <strong className="text-web-ink">Email (legal and compliance):</strong>{" "}
        <MarketingLink
          href="mailto:legal@easner.com"
          analyticsLocation="legal_contact_email"
          ctaLabel="legal@easner.com"
          className="font-semibold text-brand-primary hover:underline"
        >
          legal@easner.com
        </MarketingLink>
        <br />
        <strong className="text-web-ink">For Support:</strong>{" "}
        <SupportChatTrigger variant="link" analyticsLocation="legal_support_chat">
          Live Chat
        </SupportChatTrigger>{" "}
        or email{" "}
        <MarketingLink
          href="mailto:support@easner.com"
          analyticsLocation="legal_support_email"
          ctaLabel="support@easner.com"
          className="font-semibold text-brand-primary hover:underline"
        >
          support@easner.com
        </MarketingLink>
        <br />
        <strong className="text-web-ink">Phone:</strong> +1 628 228 6083
        <br />
        <strong className="text-web-ink">Website:</strong> www.easner.com
      </p>
    </div>
  )
}

function renderTableCell(cell: string) {
  const parts = cell.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  if (parts.length === 1 && !parts[0].includes("**")) {
    return cell
  }
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-web-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function PolicyTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
      <table className="min-w-full text-sm text-web-body">
        <thead>
          <tr className="bg-web-plate">
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-web-hairline last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top">
                  {renderTableCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PolicyExternalLink({
  href,
  children,
  analyticsLocation,
}: {
  href: string
  children: ReactNode
  analyticsLocation: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-brand-primary hover:underline"
      onClick={() => trackLinkClick(analyticsLocation, href, href, { external: true })}
    >
      {children}
    </a>
  )
}
