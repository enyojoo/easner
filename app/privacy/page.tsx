"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPage() {
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
              <Shield className="h-6 w-6 text-novapay-primary" />
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600">Last updated: January 2024</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Personal Information:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Name, email address, phone number</li>
                    <li>Date of birth and government-issued ID</li>
                    <li>Address and other contact information</li>
                    <li>Financial information for transaction processing</li>
                  </ul>

                  <h4 className="font-medium text-gray-800">Usage Information:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Transaction history and patterns</li>
                    <li>Device information and IP addresses</li>
                    <li>Log data and cookies</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Process and complete money transfer transactions</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Improve our services and user experience</li>
                  <li>Send important updates and notifications</li>
                  <li>Provide customer support</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Information Sharing</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We do not sell, trade, or rent your personal information to third parties. We may share your
                  information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>With service providers who help us operate our business</li>
                  <li>To comply with legal obligations and law enforcement requests</li>
                  <li>To prevent fraud and protect the security of our service</li>
                  <li>With your explicit consent</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure data centers and infrastructure</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Data Retention</h3>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and comply with
                  legal obligations. Transaction records may be kept for up to 7 years as required by financial
                  regulations.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate data</li>
                  <li>Request deletion of your data (subject to legal requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Data portability where technically feasible</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies and Tracking</h3>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and
                  improve our services. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">8. International Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  As we provide international money transfer services, your information may be transferred to and
                  processed in countries other than your own. We ensure appropriate safeguards are in place for such
                  transfers.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Children's Privacy</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect
                  personal information from children under 18.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to This Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes via
                  email or through our platform. Your continued use of our services constitutes acceptance of the
                  updated policy.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Contact Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                  <br />
                  Email: privacy@novapay.com
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
