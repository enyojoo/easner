import { ContactHero } from "@/components/marketing/contact-hero"
import { ContactBooking } from "@/components/marketing/contact-booking"
import { ContactSupportNotice } from "@/components/marketing/contact-support-notice"
import { contactMetadata } from "@/lib/marketing/content/contact"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({ metadata: contactMetadata })

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <section className="bg-[#F6F3EB] pb-12 pt-0 sm:pb-16 md:pb-24">
        <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
          <ContactBooking />
          <ContactSupportNotice />
        </div>
      </section>
    </>
  )
}
