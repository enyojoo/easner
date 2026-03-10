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
import { Menu, X, ChevronDown } from "lucide-react"
import { NAV_SECTIONS } from "@/lib/nav-config"

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

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
                <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-easner-primary hover:bg-easner-primary-50 transition-colors data-[state=open]:text-easner-primary data-[state=open]:bg-easner-primary-50">
                  {section.label}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  className="w-[min(20rem,90vw)] p-0 rounded-xl border border-gray-200 shadow-xl"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {section.label}
                    </span>
                  </div>
                  <div
                    className={
                      section.items.length > 3
                        ? "grid grid-cols-2 gap-px bg-gray-100 p-2"
                        : "p-2 space-y-0.5"
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

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {section.label}
                  </span>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-900 hover:bg-easner-primary-50 hover:text-easner-primary-600 transition-colors"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <Link href="/access" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-easner-primary hover:bg-easner-primary-600 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
