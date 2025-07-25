"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between px-0">
          <Link href="/" className="flex space-x-3 items-start justify-center">
            <img src="/logo.svg" alt="NovaPay Logo" className="w-24 h-14" />
            
          </Link>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-novapay-primary hover:bg-novapay-primary-50">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-novapay-primary hover:bg-novapay-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
