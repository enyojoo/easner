"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-easner-primary hover:text-easner-primary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Link>
          <BrandLogo size="md" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg border-0 ring-1 ring-gray-100">
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using Easner's services, you accept and agree to be bound by the terms and provisions
                  of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. About Easner</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Easner, Inc. is a Delaware C-corporation that operates the Easner platform and mobile application.
                  Easner provides instant, zero-fee cross-border transfers where users send money from their local bank
                  and recipients receive funds in their bank account within 3 minutes, with no virtual wallets required.
                  Users can transfer money between supported currencies with competitive exchange rates and zero fees
                  online with Easner.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> Financial services are facilitated by licensed partners with appropriate
                  regulatory permissions in different jurisdictions. Easner acts as a technology platform connecting
                  users with these licensed financial service providers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Service Description</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Easner provides a technology platform that facilitates international money transfer services through
                  licensed partners. Our services include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Instant cross-border money transfers with zero fees</li>
                  <li>Currency exchange services with competitive rates</li>
                  <li>Transaction tracking and notifications</li>
                  <li>Customer support services</li>
                  <li>Bank-to-bank transfers without virtual wallets</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  All financial services are provided by our licensed partners who hold appropriate regulatory licenses
                  in their respective jurisdictions. Easner does not directly provide financial services but acts as a
                  technology facilitator.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-4">As a user of Easner services, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Use the service only for legitimate purposes</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Understand that services are provided by licensed third-party partners</li>
                  <li>
                    <strong>Partner Network:</strong> As we expand our global network, we may share information with
                    potential financial service partners under appropriate confidentiality agreements to evaluate
                    service capabilities.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Fees and Charges</h2>
                <p className="text-gray-700 leading-relaxed">
                  Easner currently offers zero-fee transfers for supported currency pairs and corridors. However, fees
                  may apply in certain circumstances and will be clearly displayed before you complete any transaction.
                  Exchange rates are provided by our licensed partners and may include a margin. We reserve the right to
                  introduce fees in the future with appropriate notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Transaction Limits and Regulatory Compliance
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Transaction limits may apply based on your verification level, destination country, and regulatory
                  requirements imposed by our licensed partners. These limits are in place to ensure compliance with
                  anti-money laundering regulations, know-your-customer requirements, and to protect our users. Limits
                  may vary by jurisdiction and are subject to change.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
                <p className="text-gray-700 leading-relaxed">
                  Service availability may vary by jurisdiction and is subject to regulatory approvals and partner
                  network capabilities. We continuously work to expand our service coverage and improve reliability.
                  Transaction processing times and availability may be affected by factors including regulatory
                  requirements, partner system maintenance, and network connectivity.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use,
                  and protect your personal information. By using our services, you consent to the collection and use of
                  your information as outlined in our Privacy Policy and as required by our licensed partners for
                  regulatory compliance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, EASNER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE,
                  GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE. AS A TECHNOLOGY PLATFORM
                  FACILITATING FINANCIAL SERVICES, EASNER'S LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
                  FINANCIAL SERVICES ARE PROVIDED BY LICENSED THIRD-PARTY PARTNERS, AND EASNER'S LIABILITY FOR SUCH
                  SERVICES IS LIMITED.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account and bar access to the service immediately, without prior
                  notice or liability, under our sole discretion, for any reason whatsoever and without limitation,
                  including but not limited to a breach of the Terms. Given the regulatory nature of financial services,
                  we reserve the right to discontinue the service entirely with reasonable notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Easner is not a bank, money transmitter, or financial institution. All financial services are provided by licensed third-party partners who hold appropriate regulatory licenses in their respective jurisdictions. Easner acts solely as a technology platform facilitating connections between users and licensed financial service providers. 
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                  provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Easner, Inc.</strong>
                    <br />
                    28 Geary St Ste 650
                    <br />
                    San Francisco, CA 94108
                    <br />
                    <strong>Email:</strong> legal@easner.com
                    <br />
                    <strong>Phone:</strong> +1 628 228 6083
                    <br />
                    <strong>Website:</strong> www.easner.com
                  </p>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
