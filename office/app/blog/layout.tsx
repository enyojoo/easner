import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Easner Office",
  description: "Manage blog posts for the Easner website.",
  robots: { index: false, noindex: true },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
