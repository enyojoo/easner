"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/auth/user/register"
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
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. About This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  This Privacy Policy describes how Easner, Inc. ("Easner," "we," "us," or "our") collects, uses, and
                  shares information about you when you use our platform and mobile application. Easner provides
                  instant, zero-fee cross-border transfers through licensed financial service partners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Easner collects information you provide directly to us, such as when you create an account, use our
                  services, or contact us for support. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Personal identification information (name, email address, phone number, date of birth)</li>
                  <li>Financial information (bank account details, transaction history)</li>
                  <li>Identity verification documents (government-issued ID, proof of address)</li>
                  <li>Device and usage information</li>
                  <li>Location data (for fraud prevention and regulatory compliance)</li>
                  <li>Biometric data (if required for identity verification)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Third-Party Partner Information:</strong> Our licensed financial service partners may also
                  collect additional information as required by their regulatory obligations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide, maintain, and improve our platform services</li>
                  <li>Process transactions through our licensed partners</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Comply with legal and regulatory requirements (AML, KYC, sanctions screening)</li>
                  <li>Communicate with you about our services and transactions</li>
                  <li>Provide customer support</li>
                  <li>Develop and improve our early-stage platform</li>
                  <li>Share with licensed partners as necessary for service provision</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>With your consent or at your direction</li>
                  <li>With licensed financial service partners who facilitate transactions</li>
                  <li>With service providers who assist us in operating our business</li>
                  <li>To comply with legal obligations, court orders, or regulatory requests</li>
                  <li>To protect the rights, property, or safety of Easner, our users, or others</li>
                  <li>In connection with a merger, acquisition, or sale of assets</li>
                  <li>With regulatory authorities as required by financial services regulations</li>
                  <li>For fraud prevention and risk management purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction. However, no method of
                  transmission over the internet or electronic storage is 100% secure. We continuously enhance our
                  security measures to meet industry standards and regulatory requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services, comply with
                  legal obligations (including financial services regulations that may require extended retention
                  periods), resolve disputes, and enforce our agreements. Retention periods may vary depending on the
                  type of information and regulatory requirements in different jurisdictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location, you may have certain rights regarding your personal information,
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to delete your personal information (subject to regulatory requirements)</li>
                  <li>The right to restrict processing of your information</li>
                  <li>The right to data portability</li>
                  <li>The right to object to processing</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Note:</strong> Some rights may be limited by regulatory requirements applicable to financial
                  services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to collect information about your browsing activities
                  and to provide you with a personalized experience. You can control cookies through your browser
                  settings, but disabling cookies may affect the functionality of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of
                  residence, including the United States where Easner is headquartered. We ensure that such transfers
                  are conducted in accordance with applicable data protection laws and that appropriate safeguards are
                  in place. Our licensed partners may also process your information in their respective jurisdictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect
                  personal information from children under 18. If we become aware that we have collected personal
                  information from a child under 18, we will take steps to delete such information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Regulatory Compliance</h2>
                <p className="text-gray-700 leading-relaxed">
                  As a platform facilitating financial services, we and our licensed partners are subject to various
                  regulatory requirements including anti-money laundering (AML), know-your-customer (KYC), and sanctions
                  screening obligations. This may require us to collect, process, and retain additional information and
                  to share information with regulatory authorities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Service Evolution</h2>
                <p className="text-gray-700 leading-relaxed">
                  As we expand our services and enter new markets, our privacy practices may evolve to meet local
                  regulatory requirements and enhance user experience. We remain committed to maintaining the highest
                  standards of data protection across all jurisdictions where we operate.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by
                  posting the new Privacy Policy on our website and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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
