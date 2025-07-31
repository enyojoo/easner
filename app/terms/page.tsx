"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-novapay-primary-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <BrandLogo size="lg" className="mx-auto mb-4" />
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm text-novapay-primary hover:text-novapay-primary-600 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Registration
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6 text-novapay-primary" />
              Terms of Service
            </CardTitle>
            <p className="text-gray-600">Last updated: January 2024</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using NovaPay's services, you accept and agree to be bound by the terms and provision
                  of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Service Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  NovaPay provides international money transfer services, allowing users to send money across borders
                  securely and efficiently. Our services include currency conversion, recipient management, and
                  transaction tracking.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Use the service only for legitimate purposes</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Transaction Limits and Fees</h3>
                <p className="text-gray-700 leading-relaxed">
                  Transaction limits and fees are subject to change and will be clearly displayed before you complete
                  any transaction. We reserve the right to modify our fee structure with appropriate notice to users.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Prohibited Activities</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Money laundering or terrorist financing</li>
                  <li>Fraudulent or illegal activities</li>
                  <li>Violation of any applicable laws or regulations</li>
                  <li>Sending money to sanctioned countries or individuals</li>
                  <li>Using the service for commercial purposes without authorization</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Account Suspension and Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time if we suspect fraudulent
                  activity, violation of these terms, or for any other reason we deem necessary to protect our service
                  and users.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation of Liability</h3>
                <p className="text-gray-700 leading-relaxed">
                  NovaPay shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Privacy and Data Protection</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                  service, to understand our practices regarding the collection and use of your personal information.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to Terms</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes
                  via email or through our platform. Continued use of the service after such modifications constitutes
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Contact Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                  <br />
                  Email: legal@novapay.com
                  <br />
                  Address: [Your Business Address]
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
