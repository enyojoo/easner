"use client"

import { Linkedin } from "lucide-react"
import { BrandLogo } from "@easner/shared"
import { SupportChatTrigger } from "@/components/marketing/support-chat-trigger"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { trackLinkClick } from "@/lib/marketing/analytics"
import { REGULATORY_FOOTER_PARAGRAPHS } from "@/lib/marketing/shared-content"
import { NAV_SECTIONS, type NavGroup } from "@/lib/nav-config"

/** Sitemap columns: the product groups from the header menu, then the company and legal pages. */
const FOOTER_COLUMNS: NavGroup[] = [
  ...NAV_SECTIONS[0].groups.map((group) =>
    group.label === "Personal"
      ? { ...group, items: [...group.items, { label: "Download the app", href: "/app", icon: "wallet" as const }] }
      : group,
  ),
  {
    label: "Company",
    items: [
      { label: "About", href: "/about", icon: "building" },
      { label: "Contact", href: "/contact", icon: "user" },
      { label: "Terms", href: "/terms", icon: "file" },
      { label: "Privacy Policy", href: "/privacy", icon: "file" },
      { label: "Compliance", href: "/compliance", icon: "file" },
    ],
  },
]

const socialClass = "text-web-meta transition-colors hover:text-brand-primary"

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-web-hairline bg-web-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="grid content-start gap-4">
            <BrandLogo size="sm" className="h-7 w-fit" />
            <p className="max-w-xs text-sm leading-6 text-web-body">
              Stablecoin-native banking and payment infrastructure for individuals and businesses.
            </p>
            <p className="text-sm text-web-body">
              Have questions?{" "}
              <SupportChatTrigger variant="link" className="text-sm" analyticsLocation="footer_support_chat">
                Chat with us
              </SupportChatTrigger>
              .
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/easnerbanking"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="X (Twitter)"
                onClick={() => trackLinkClick("footer_social_x", "X", "https://x.com/easnerbanking", { external: true })}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/easner/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="LinkedIn"
                onClick={() =>
                  trackLinkClick("footer_social_linkedin", "LinkedIn", "https://www.linkedin.com/company/easner/", { external: true })
                }
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
          <nav aria-label="Footer" className="col-span-full grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.label}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-web-meta">{column.label}</div>
                <ul className="mt-4 grid gap-3">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <MarketingLink
                        href={item.href}
                        analyticsLocation={`footer_${item.href.replace(/^\//, "").replace(/-/g, "_")}`}
                        ctaLabel={item.label}
                        className="text-sm text-web-nav transition-colors hover:text-brand-primary"
                      >
                        {item.label}
                      </MarketingLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-4 border-t border-web-hairline py-6 sm:py-8">
          <div className="text-sm text-web-meta">© {new Date().getFullYear()} Easner Group, Inc.</div>
          <div className="max-w-4xl space-y-3 text-xs leading-relaxed text-web-meta">
            {REGULATORY_FOOTER_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
