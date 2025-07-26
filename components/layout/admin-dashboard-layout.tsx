"use client"

import type React from "react"

import { BrandLogo } from "@/components/brand/brand-logo"

interface AdminDashboardLayoutProps {
  children: React.ReactNode
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <BrandLogo size="sm" />
            <span className="text-sm text-novapay-primary font-medium">Admin Panel</span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
