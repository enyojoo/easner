"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand/brand-logo"

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandLogo size="sm" className="h-7" />
          </Link>

          <div className="flex items-center space-x-3">
            <Link href="/access">
              <Button className="bg-easner-primary hover:bg-easner-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Get Early Access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
