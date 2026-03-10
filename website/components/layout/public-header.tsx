"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@easner/shared"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { NAV_SECTIONS } from "@/lib/nav-config"

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [mobileExpanded, setMobileExpanded] = React.useState<Set<string>>(new Set())

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
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandLogo size="sm" className="h-7" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_SECTIONS.map((section) => (
              <DropdownMenu key={section.label}>
                <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-easner-primary hover:bg-easner-primary-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:text-easner-primary data-[state=open]:bg-easner-primary-50">
                  {section.label}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className={
                    section.items.length > 3
                      ? "w-[min(28rem,90vw)] p-2 rounded-xl border border-gray-200 shadow-xl"
                      : "w-[min(14rem,45vw)] p-2 rounded-xl border border-gray-200 shadow-xl"
                  }
                >
                  <div
                    className={
                      section.items.length > 3
                        ? "grid grid-cols-2 gap-2"
                        : "space-y-0.5"
                    }
                  >
                    {section.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-900 hover:bg-easner-primary-50 hover:text-easner-primary-600 transition-colors cursor-pointer"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/access">
              <Button className="bg-easner-primary hover:bg-easner-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-700 hover:text-easner-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav - collapsible sections, scrollable with CTA pinned */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col max-h-[calc(100dvh-4rem)] overflow-hidden border-t border-gray-200">
            <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4">
              <div className="flex flex-col gap-1">
                {NAV_SECTIONS.map((section) => {
                  const isExpanded = mobileExpanded.has(section.label)
                  return (
                    <div key={section.label} className="border-b border-gray-100 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => toggleMobileSection(section.label)}
                        className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {section.label}
                        <ChevronRight
                          className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="pl-3 pb-2 space-y-0.5">
                          {section.items.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-easner-primary-50 hover:text-easner-primary-600 transition-colors"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </nav>
            <div className="flex-shrink-0 pt-4 pb-4 px-4 border-t border-gray-200 bg-white">
              <Link href="/access" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-easner-primary hover:bg-easner-primary-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
