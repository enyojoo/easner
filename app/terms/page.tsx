import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <BrandLogo size="md" />
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm text-novapay-primary hover:text-novapay-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Registration
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using NovaPay's money transfer services, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              NovaPay provides international money transfer services that allow users to send money across borders. Our
              services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>International money transfers</li>
              <li>Currency conversion services</li>
              <li>Transaction tracking and notifications</li>
              <li>Customer support services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">As a user of NovaPay services, you agree to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the service for illegal activities</li>
              <li>Maintain the security of your account credentials</li>
              <li>Report any suspicious activities immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Fees and Charges</h2>
            <p className="text-gray-700 leading-relaxed">
              NovaPay charges fees for money transfer services. All applicable fees will be clearly displayed before you
              complete any transaction. Fees may vary based on the destination country, transfer amount, and payment
              method selected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Transaction Limits</h2>
            <p className="text-gray-700 leading-relaxed">
              Transaction limits may apply based on your verification level, destination country, and regulatory
              requirements. These limits are in place to ensure compliance with anti-money laundering (AML) and know
              your customer (KYC) regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
              protect your personal information. By using our services, you consent to the collection and use of your
              information as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              NovaPay shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting
              from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice
              or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
              not limited to a breach of the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
              provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at legal@novapay.com or through
              our customer support channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
