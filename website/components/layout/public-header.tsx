"use client"

import * as React from "react"
import Link from "next/link"
import { OpenAccountButton, OpenAccountDialog } from "@/components/marketing/open-account-dialog"
import { BrandLogo } from "@easner/shared"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NAV_LEADING_LINKS,
  NAV_LINKS,
  NAV_SECTIONS,
  NAV_TRAILING_LINKS,
  type NavIconName,
} from "@/lib/nav-config"

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [mobileExpanded, setMobileExpanded] = React.useState<Set<string>>(new Set())
  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = "0"
      document.body.style.right = "0"
      document.body.style.overflow = "hidden"
    } else {
      const scrollY = Math.abs(parseInt(document.body.style.top || "0", 10))
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      window.scrollTo(0, scrollY)
    }
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const toggleMobileSection = (label: string) => {
    setMobileExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-[#E4DED1]/80 bg-white/[0.82] shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandLogo size="sm" className="h-7" />
          </Link>

          {/* Desktop nav: Home, About → Products → rest → Contact */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LEADING_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#3D443E] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC]"
              >
                {item.label}
              </Link>
            ))}
            {NAV_SECTIONS.map((section) => (
              <DropdownMenu key={section.label}>
                <DropdownMenuTrigger className="flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-[#3D443E] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:bg-[#F8F6F0] data-[state=open]:text-[#007ACC]">
                  {section.label}
                  <ChevronDownIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  sideOffset={4}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="w-[min(36rem,90vw)] rounded-2xl border border-[#E4DED1] bg-white p-2 shadow-2xl"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item) => {
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3 text-[#0F1110] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC]"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F6F0] text-[#007ACC]">
                              <NavIcon name={item.icon} className="h-4 w-4" />
                            </div>
                            <span>
                              <span className="block font-semibold">{item.label}</span>
                              {item.description && (
                                <span className="mt-1 block text-xs leading-5 text-[#6F756F]">
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#3D443E] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC]"
              >
                {item.label}
              </Link>
            ))}
            {NAV_TRAILING_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#3D443E] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <OpenAccountButton
              className="rounded-full bg-[#007ACC] text-white shadow-[0_10px_25px_rgba(0,122,204,0.2)] transition-all duration-200 hover:bg-[#0062A3] hover:shadow-[0_14px_32px_rgba(0,122,204,0.22)]"
              dialogOpen={accountDialogOpen}
              onDialogOpenChange={setAccountDialogOpen}
            />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-[#3D443E] hover:text-[#007ACC]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav - collapsible sections, scrollable with CTA pinned */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col max-h-[calc(100dvh-4rem)] overflow-hidden border-t border-[#E4DED1]">
            <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4">
              <div className="flex flex-col gap-1">
                {NAV_LEADING_LINKS.map((item) => (
                  <div key={item.href} className="border-b border-[#E9E4D8]">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center rounded-lg px-3 py-3 text-sm font-semibold text-[#0F1110] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC]"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
                {NAV_SECTIONS.map((section) => {
                  const isExpanded = mobileExpanded.has(section.label)
                  return (
                    <div key={section.label} className="border-b border-[#E9E4D8]">
                      <button
                        type="button"
                        onClick={() => toggleMobileSection(section.label)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#0F1110] transition-colors hover:bg-[#F8F6F0]"
                      >
                        {section.label}
                        <ChevronRightIcon
                          className={`h-4 w-4 text-[#6F756F] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="pl-3 pb-2 space-y-0.5">
                          {section.items.map((item) => {
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-[#3D443E] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC]"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F6F0] text-[#007ACC]">
                                  <NavIcon name={item.icon} className="h-4 w-4" />
                                </div>
                                <span>
                                  <span className="block font-semibold">{item.label}</span>
                                  {item.description && (
                                    <span className="mt-0.5 block text-xs leading-5 text-[#6F756F]">
                                      {item.description}
                                    </span>
                                  )}
                                </span>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
                {NAV_LINKS.map((item) => (
                  <div key={item.href} className="border-b border-[#E9E4D8]">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center rounded-lg px-3 py-3 text-sm font-semibold text-[#0F1110] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC]"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
                {NAV_TRAILING_LINKS.map((item) => (
                  <div key={item.href} className="border-b border-[#E9E4D8] last:border-b-0">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center rounded-lg px-3 py-3 text-sm font-semibold text-[#0F1110] transition-colors hover:bg-[#F8F6F0] hover:text-[#007ACC]"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </nav>
            <div className="flex-shrink-0 border-t border-[#E4DED1] bg-white px-4 pb-4 pt-4">
              <OpenAccountButton
                className="w-full rounded-full bg-[#007ACC] text-white hover:bg-[#0062A3]"
                dialogOpen={accountDialogOpen}
                onDialogOpenChange={setAccountDialogOpen}
                onPress={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
      <OpenAccountDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} />
    </header>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
  }
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  if (name === "code") {
    return (
      <svg {...common}>
        <path {...stroke} d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
      </svg>
    )
  }

  if (name === "card") {
    return (
      <svg {...common}>
        <rect {...stroke} x="3" y="6" width="18" height="12" rx="2" />
        <path {...stroke} d="M3 10h18M7 15h3" />
      </svg>
    )
  }

  if (name === "receipt" || name === "file") {
    return (
      <svg {...common}>
        <path {...stroke} d="M7 3h8l4 4v14l-2-1-2 1-2-1-2 1-2-1-2 1V3z" />
        <path {...stroke} d="M9 9h6M9 13h6M9 17h4" />
      </svg>
    )
  }

  if (name === "wallet") {
    return (
      <svg {...common}>
        <path {...stroke} d="M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a3 3 0 0 1 3-3h11" />
        <path {...stroke} d="M16 13h.01" />
      </svg>
    )
  }

  if (name === "coins") {
    return (
      <svg {...common}>
        <ellipse {...stroke} cx="12" cy="6" rx="6" ry="3" />
        <path {...stroke} d="M6 6v6c0 1.7 2.7 3 6 3s6-1.3 6-3V6M6 12v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
      </svg>
    )
  }

  if (name === "user") {
    return (
      <svg {...common}>
        <circle {...stroke} cx="12" cy="8" r="4" />
        <path {...stroke} d="M5 21a7 7 0 0 1 14 0" />
      </svg>
    )
  }

  if (name === "briefcase") {
    return (
      <svg {...common}>
        <path {...stroke} d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
        <rect {...stroke} x="3" y="6" width="18" height="14" rx="2" />
        <path {...stroke} d="M3 12h18" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path {...stroke} d="M4 10l8-5 8 5M6 10v8M10 10v8M14 10v8M18 10v8M4 20h16" />
    </svg>
  )
}
