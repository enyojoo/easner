import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information you provide directly to us, such as when you create an account, use our services,
              or contact us. This includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Financial information (bank account details, transaction history)</li>
              <li>Identity verification documents (passport, driver's license)</li>
              <li>Device and usage information (IP address, browser type, app usage)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide, maintain, and improve our money transfer services</li>
              <li>Process transactions and send related information</li>
              <li>Verify your identity and comply with legal requirements</li>
              <li>Detect, prevent, and address fraud and security issues</li>
              <li>Communicate with you about our services</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>With service providers who assist us in operating our business</li>
              <li>With financial institutions to process transactions</li>
              <li>With regulatory authorities as required by law</li>
              <li>With law enforcement when legally required</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure
              servers, and regular security assessments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services, comply with legal
              obligations, resolve disputes, and enforce our agreements. Transaction records may be retained for
              extended periods as required by financial regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your information (subject to legal requirements)</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to collect information about your browsing activities and
              to provide personalized experiences. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. International Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure
              appropriate safeguards are in place to protect your information in accordance with applicable data
              protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
              information from children under 18. If we become aware that we have collected such information, we will
              take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
              the new policy on our website and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at
              privacy@novapay.com or through our customer support channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
