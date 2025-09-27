"use client"

import { EarlyAccessForm } from "@/components/early-access-form"
import Link from "next/link"
import { BrandLogo } from "@/components/brand/brand-logo"

export default function EarlyAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-easner-primary-50 via-white to-blue-50">
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/">
            <BrandLogo size="md" />
          </Link>
        </div>

        {/* Form */}
        <EarlyAccessForm />
      </main>
    </div>
  )
}
