import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image
            src="https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Logo.svg"
            alt="Easner"
            width={120}
            height={34}
            className="h-8 w-auto"
          />
        </Link>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {children}
      </div>
    </div>
  )
}
