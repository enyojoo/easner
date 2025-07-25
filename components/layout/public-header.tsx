"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PublicHeader() {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-xl font-bold">Novapay</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
