import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recipients - Easner",
  description: "Manage your saved recipients for quick and easy money transfers. Add, edit, and organize your contact list.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function RecipientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
