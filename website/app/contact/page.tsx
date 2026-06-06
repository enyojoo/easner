import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell"
import { ContactHero } from "@/components/marketing/contact-hero"
import { ContactBooking } from "@/components/marketing/contact-booking"
import { ContactSupportNotice } from "@/components/marketing/contact-support-notice"
import { contactMetadata } from "@/lib/marketing/content/contact"

export const metadata: Metadata = {
  title: contactMetadata.title,
  description: contactMetadata.description,
  keywords: contactMetadata.keywords,
  openGraph: {
    title: contactMetadata.title,
    description: contactMetadata.description,
  },
}

export default function ContactPage() {
  return (
    <MarketingPageShell>
      <ContactHero />
      <section className="bg-[#F6F3EB] pb-16 pt-2 md:pb-24">
        <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
          <ContactBooking />
          <ContactSupportNotice />
        </div>
      </section>
    </MarketingPageShell>
  )
}
