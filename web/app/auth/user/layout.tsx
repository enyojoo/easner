import type { Metadata } from "next"
import Link from "next/link"
import { BrandLogo } from "@/components/brand/brand-logo"

export const metadata: Metadata = {
  title: "User Authentication - Easner",
  description: "Sign in to your Easner account to send money internationally with zero fees.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function UserAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 bg-background overflow-y-auto">
      <div className="flex-shrink-0 sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <BrandLogo size="lg" className="h-7 sm:h-8" />
        </Link>
      </div>
      <div className="mt-4 sm:mt-6 lg:mt-8 sm:mx-auto sm:w-full sm:max-w-md flex-shrink-0">
        {children}
      </div>
    </div>
  )
}
