import { ContactHero } from "@/components/marketing/contact-hero"
import { ContactBooking } from "@/components/marketing/contact-booking"
import { ContactSupportNotice } from "@/components/marketing/contact-support-notice"
import { contactMetadata } from "@/lib/marketing/content/contact"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: contactMetadata, path: "/contact" })

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ])
        )}
      />
      <ContactHero />
      <section className="bg-[#F6F3EB] pb-12 pt-0 sm:pb-16 md:pb-24">
        <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
          <ContactSupportNotice />
          <ContactBooking />
        </div>
      </section>
    </>
  )
}
