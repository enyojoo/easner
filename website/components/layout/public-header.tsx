"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Briefcase,
  Code2,
  Coins,
  CreditCard,
  HandCoins,
  Landmark,
  Link2,
  Palette,
  ReceiptText,
  ShoppingCart,
  Smartphone,
  User,
  Users2,
  type LucideIcon,
} from "lucide-react"
import { OpenAccountButton, OpenAccountDialog } from "@/components/marketing/open-account-dialog"
import { BrandLogo } from "@easner/shared"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { captureNavClick } from "@/lib/marketing/analytics"
import { cn } from "@/lib/utils"
import { NAV_LEADING_LINKS, NAV_LINKS, NAV_SECTIONS, NAV_TRAILING_LINKS, type NavIconName } from "@/lib/nav-config"

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

  const trackNavClick = (label: string, href: string) => {
    captureNavClick(label, href)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-web-hairline/80 bg-white/[0.82] shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => trackNavClick("Logo", "/")}>
            <BrandLogo size="sm" className="h-7" />
          </Link>

          {/* Desktop nav: Home, About → Personal, Business, Build → Contact */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LEADING_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => trackNavClick(item.label, item.href)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-web-nav transition-colors hover:bg-web-plate hover:text-brand-primary"
              >
                {item.label}
              </Link>
            ))}
            {NAV_SECTIONS.map((section) => (
              <DropdownMenu key={section.label}>
                <DropdownMenuTrigger className="flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-web-nav transition-colors hover:bg-web-plate hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:bg-web-plate data-[state=open]:text-brand-primary">
                  {section.label}
                  <ChevronDownIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  sideOffset={8}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className={cn(
                    "rounded-[20px] border border-web-hairline bg-web-canvas p-2 shadow-lift",
                    section.items.length > 3 ? "w-[min(46rem,94vw)]" : "w-[min(36rem,94vw)]",
                  )}
                >
                  <div className="grid grid-cols-[13.5rem_1fr] gap-2">
                    <div className="flex flex-col justify-between rounded-[14px] bg-web-band p-5">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-web-meta">{section.label}</div>
                        <div className="mt-3 text-base font-semibold leading-6 text-web-ink">{section.intro.title}</div>
                        <p className="mt-1.5 text-sm leading-[22px] text-web-body">{section.intro.body}</p>
                      </div>
                      <DropdownMenuItem
                        asChild
                        className="group mt-5 w-fit gap-1.5 rounded-[8px] px-0 py-0 text-sm font-semibold text-brand-primary hover:bg-transparent focus:bg-transparent"
                      >
                        <Link href={section.intro.cta.href} onClick={() => trackNavClick(section.intro.cta.label, section.intro.cta.href)}>
                          {section.intro.cta.label}
                          <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <div className={cn("grid content-start gap-1 py-1", section.items.length > 3 && "grid-cols-2")}>
                      {section.items.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            onClick={() => trackNavClick(item.label, item.href)}
                            className="group flex cursor-pointer items-start gap-3 rounded-[12px] px-3 py-3 text-web-ink transition-colors hover:bg-web-plate"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-web-hairline bg-web-canvas text-brand-primary transition-colors group-hover:border-brand-primary/30">
                              <NavIcon name={item.icon} className="h-4 w-4" />
                            </div>
                            <span>
                              <span className="block text-sm font-semibold group-hover:text-brand-primary">{item.label}</span>
                              {item.description && <span className="mt-0.5 block text-xs leading-5 text-web-meta">{item.description}</span>}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => trackNavClick(item.label, item.href)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-web-nav transition-colors hover:bg-web-plate hover:text-brand-primary"
              >
                {item.label}
              </Link>
            ))}
            {NAV_TRAILING_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => trackNavClick(item.label, item.href)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-web-nav transition-colors hover:bg-web-plate hover:text-brand-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <OpenAccountButton
              ctaLocation="nav_cta"
              pill={false}
              className="rounded-full shadow-cta"
              dialogOpen={accountDialogOpen}
              onDialogOpenChange={setAccountDialogOpen}
            />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden -mr-2.5 p-2.5 text-web-nav hover:text-brand-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav - collapsible sections, scrollable with CTA pinned */}
        {mobileMenuOpen && (
          <div className="lg:hidden flex flex-col max-h-[calc(100dvh-4rem)] overflow-hidden border-t border-web-hairline">
            <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4">
              <div className="flex flex-col gap-1">
                {NAV_LEADING_LINKS.map((item) => (
                  <div key={item.href} className="border-b border-web-hairline">
                    <Link
                      href={item.href}
                      onClick={() => {
                        trackNavClick(item.label, item.href)
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center rounded-[8px] px-3 py-3 text-sm font-semibold text-web-ink transition-colors hover:bg-web-plate hover:text-brand-primary"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
                {NAV_SECTIONS.map((section) => {
                  const isExpanded = mobileExpanded.has(section.label)
                  return (
                    <div key={section.label} className="border-b border-web-hairline">
                      <button
                        type="button"
                        onClick={() => toggleMobileSection(section.label)}
                        className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left text-sm font-semibold text-web-ink transition-colors hover:bg-web-plate"
                      >
                        {section.label}
                        <ChevronRightIcon
                          className={`h-4 w-4 text-web-meta transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="space-y-0.5 pb-3 pl-3">
                          <p className="px-3 pb-2 text-xs leading-5 text-web-meta">{section.intro.body}</p>
                          {section.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => {
                                trackNavClick(item.label, item.href)
                                setMobileMenuOpen(false)
                              }}
                              className="flex items-start gap-3 rounded-[8px] px-3 py-2.5 text-web-nav transition-colors hover:bg-web-plate hover:text-brand-primary"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-web-plate text-brand-primary">
                                <NavIcon name={item.icon} className="h-4 w-4" />
                              </div>
                              <span>
                                <span className="block font-semibold">{item.label}</span>
                                {item.description && <span className="mt-0.5 block text-xs leading-5 text-web-meta">{item.description}</span>}
                              </span>
                            </Link>
                          ))}
                          <Link
                            href={section.intro.cta.href}
                            onClick={() => {
                              trackNavClick(section.intro.cta.label, section.intro.cta.href)
                              setMobileMenuOpen(false)
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-brand-primary"
                          >
                            {section.intro.cta.label}
                            <ArrowRight className="size-4" aria-hidden="true" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
                {NAV_LINKS.map((item) => (
                  <div key={item.href} className="border-b border-web-hairline">
                    <Link
                      href={item.href}
                      onClick={() => {
                        trackNavClick(item.label, item.href)
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center rounded-[8px] px-3 py-3 text-sm font-semibold text-web-ink transition-colors hover:bg-web-plate hover:text-brand-primary"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
                {NAV_TRAILING_LINKS.map((item) => (
                  <div key={item.href} className="border-b border-web-hairline last:border-b-0">
                    <Link
                      href={item.href}
                      onClick={() => {
                        trackNavClick(item.label, item.href)
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center rounded-[8px] px-3 py-3 text-sm font-semibold text-web-ink transition-colors hover:bg-web-plate hover:text-brand-primary"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </nav>
            <div className="flex-shrink-0 border-t border-web-hairline bg-white px-4 pb-4 pt-4">
              <OpenAccountButton
                ctaLocation="nav_cta"
                pill={false}
                className="w-full rounded-full"
                dialogOpen={accountDialogOpen}
                onDialogOpenChange={setAccountDialogOpen}
                onPress={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
      <OpenAccountDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} ctaLocation="nav_cta" />
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

/** The same lucide icons as the homepage product grid (visual-slot.tsx), so the menu and the grid match. */
const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  building: Landmark,
  landmark: Landmark,
  file: ReceiptText,
  receipt: ReceiptText,
  wallet: Smartphone,
  card: CreditCard,
  coins: Coins,
  palette: Palette,
  code: Code2,
  briefcase: Briefcase,
  user: User,
  cart: ShoppingCart,
  users: Users2,
  handcoins: HandCoins,
  link: Link2,
}

function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = NAV_ICONS[name]
  return <Icon className={className} strokeWidth={2} aria-hidden="true" />
}
