import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support - Easner",
  description: "Get help with your money transfers and find answers to common questions about Easner's services.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
