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
            className="inline-flex items-center gap-2 text-novapay-primary hover:text-novapay-primary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Link>
          <BrandLogo size="sm" />
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
                  By accessing and using NOVAMONEY's services, you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  NOVAMONEY provides international money transfer services that allow users to send money across
                  borders. Our services include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>International money transfers</li>
                  <li>Currency exchange services</li>
                  <li>Transaction tracking and notifications</li>
                  <li>Customer support services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-4">As a user of NOVAMONEY services, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Use the service only for legitimate purposes</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Fees and Charges</h2>
                <p className="text-gray-700 leading-relaxed">
                  NOVAMONEY charges fees for money transfer services. All applicable fees will be clearly displayed
                  before you complete any transaction. Fees may vary based on the destination country, transfer amount,
                  and payment method selected.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Transaction Limits</h2>
                <p className="text-gray-700 leading-relaxed">
                  Transaction limits may apply based on your verification level, destination country, and regulatory
                  requirements. These limits are in place to ensure compliance with anti-money laundering regulations
                  and to protect our users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use,
                  and protect your personal information. By using our services, you consent to the collection and use of
                  your information as outlined in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  NOVAMONEY shall not be liable for any indirect, incidental, special, consequential, or punitive
                  damages, including without limitation, loss of profits, data, use, goodwill, or other intangible
                  losses, resulting from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account and bar access to the service immediately, without prior
                  notice or liability, under our sole discretion, for any reason whatsoever and without limitation,
                  including but not limited to a breach of the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                  provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> support@novamoney.net
                    <br />
                    <strong>Website:</strong> www.novamoney.net
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
