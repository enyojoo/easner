import type { Metadata } from "next"
import { TermsPolicyPage } from "@/components/legal/terms-content"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Easner Mobile (Easner Personal Banking), Easner Business (Easner Business Banking), and related services.",
}

export default function TermsPage() {
  return <TermsPolicyPage />
}
