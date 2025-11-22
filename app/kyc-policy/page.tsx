"use client"

import { ArrowLeft } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function KYCPolicyPage() {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-easner-primary hover:text-easner-primary-600 transition-colors p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <BrandLogo size="md" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg border-0 ring-1 ring-gray-100">
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">KYC/KYB Policy</h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  Easner, Inc. ("Easner," "we," "us," or "our") is committed to maintaining the highest standards of
                  compliance with anti-money laundering (AML) and know-your-customer (KYC) regulations. As a technology
                  platform facilitating financial services through licensed partners, we conduct comprehensive KYC
                  (Know Your Customer) and KYB (Know Your Business) verification on all users to ensure regulatory
                  compliance, prevent fraud, and protect our platform and users.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  This policy outlines our KYC/KYB procedures, the information we collect, how we use it, and your
                  rights regarding the verification process. For more information about how we handle your personal
                  data, please review our{" "}
                  <Link href="/privacy" className="text-easner-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. What is KYC/KYB?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>KYC (Know Your Customer)</strong> refers to the process of verifying the identity of
                  individual users to ensure they are who they claim to be. <strong>KYB (Know Your Business)</strong>{" "}
                  refers to the process of verifying business entities and their beneficial owners.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  These verification processes are required by law in most jurisdictions where we operate and are
                  essential for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                  <li>Preventing money laundering and terrorist financing</li>
                  <li>Complying with regulatory requirements in multiple jurisdictions</li>
                  <li>Protecting our platform and users from fraud and financial crime</li>
                  <li>Ensuring the integrity of our financial services network</li>
                  <li>Meeting the compliance standards of our licensed financial service partners</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. When We Conduct KYC/KYB</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We conduct KYC/KYB verification in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Account Registration:</strong> All users must complete identity verification when creating
                    an account
                  </li>
                  <li>
                    <strong>Before First Transaction:</strong> Users must complete verification before their first money
                    transfer
                  </li>
                  <li>
                    <strong>Periodic Reviews:</strong> We may conduct periodic re-verification to ensure information
                    remains current and accurate
                  </li>
                  <li>
                    <strong>Risk-Based Triggers:</strong> Additional verification may be required based on transaction
                    patterns, amounts, or risk indicators
                  </li>
                  <li>
                    <strong>Regulatory Requirements:</strong> When required by law or regulatory authorities in
                    specific jurisdictions
                  </li>
                  <li>
                    <strong>Partner Requirements:</strong> When our licensed financial service partners require
                    additional verification for specific corridors or services
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information We Collect for KYC/KYB</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>For Individual Users (KYC):</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Full legal name (as it appears on government-issued identification)</li>
                  <li>Date of birth</li>
                  <li>Residential address</li>
                  <li>Government-issued photo identification (passport, national ID card, driver's license)</li>
                  <li>Proof of address (utility bill, bank statement, or similar document dated within the last 3
                    months)</li>
                  <li>Phone number and email address</li>
                  <li>Additional information as required by specific jurisdictions or transaction types</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4 mb-4">
                  <strong>For Business Users (KYB):</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Business legal name and registration number</li>
                  <li>Business address and jurisdiction of incorporation</li>
                  <li>Business registration documents and certificates</li>
                  <li>Information about beneficial owners (individuals who own or control 25% or more of the business)</li>
                  <li>Authorized signatories and their identification documents</li>
                  <li>Business bank account information</li>
                  <li>Nature of business and source of funds</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Document Requirements</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Accepted Identity Documents:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Valid passport (preferred)</li>
                  <li>National ID card</li>
                  <li>Driver's license</li>
                  <li>Other government-issued photo identification as accepted in your jurisdiction</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4 mb-4">
                  <strong>Accepted Address Verification Documents:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Utility bill (electricity, water, gas, internet) dated within the last 3 months</li>
                  <li>Bank statement dated within the last 3 months</li>
                  <li>Government-issued tax document</li>
                  <li>Rental agreement or lease document</li>
                  <li>Other official documents as accepted in your jurisdiction</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Document Requirements:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Documents must be clear, legible, and in color</li>
                  <li>All four corners of the document must be visible</li>
                  <li>Documents must be valid and not expired (for identity documents)</li>
                  <li>Documents must be in English or accompanied by a certified translation</li>
                  <li>Documents must match the information provided in your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Verification Process</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our verification process typically involves the following steps:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Document Submission:</strong> You upload your identity and address verification documents
                    through our secure platform
                  </li>
                  <li>
                    <strong>Automated Checks:</strong> Our system performs initial automated verification checks on
                    document authenticity and data extraction
                  </li>
                  <li>
                    <strong>Manual Review:</strong> Our compliance team reviews your submission to ensure all
                    requirements are met
                  </li>
                  <li>
                    <strong>Additional Checks:</strong> We may conduct additional checks including sanctions screening,
                    PEP (Politically Exposed Person) screening, and adverse media checks
                  </li>
                  <li>
                    <strong>Approval or Request for Additional Information:</strong> You will be notified of the
                    verification status. If additional information is required, you will receive specific instructions
                  </li>
                </ol>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Verification Timeline:</strong> Most verifications are completed within 1-3 business days.
                  Complex cases or requests for additional information may take longer. You will be notified of any
                  delays.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. How We Use KYC/KYB Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information collected during KYC/KYB verification to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Verify your identity and prevent identity fraud</li>
                  <li>Comply with legal and regulatory requirements including AML, KYC, and sanctions screening</li>
                  <li>Assess and manage risk on our platform</li>
                  <li>Prevent money laundering, terrorist financing, and other financial crimes</li>
                  <li>Share with licensed financial service partners as necessary for transaction processing</li>
                  <li>Respond to requests from regulatory authorities and law enforcement</li>
                  <li>Maintain accurate records as required by financial services regulations</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  For detailed information about how we handle your personal data, please review our{" "}
                  <Link href="/privacy" className="text-easner-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain KYC/KYB information and documents in accordance with applicable legal and regulatory
                  requirements. Retention periods vary by jurisdiction but typically range from 5 to 7 years after the
                  closure of your account or the last transaction, as required by financial services regulations. In
                  some jurisdictions, we may be required to retain certain information for longer periods. We securely
                  store all KYC/KYB documents and information using industry-standard encryption and security measures.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Verification Status and Consequences</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Approved:</strong> Your account is verified and you can use all Easner services subject to
                  transaction limits and other terms.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Pending:</strong> Your verification is under review. You may have limited access to services
                  until verification is complete.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Rejected:</strong> Your verification was not approved. Common reasons include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Documents are unclear, expired, or invalid</li>
                  <li>Information provided does not match the documents</li>
                  <li>Documents do not meet our requirements</li>
                  <li>Additional information is required but not provided</li>
                  <li>Regulatory or compliance concerns identified during review</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  If your verification is rejected, you will receive specific feedback and may be able to resubmit with
                  corrected or additional information. We reserve the right to refuse service if verification cannot be
                  completed satisfactorily.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Your Rights and Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Your Responsibilities:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate, complete, and up-to-date information</li>
                  <li>Submit clear, valid, and authentic documents</li>
                  <li>Notify us immediately of any changes to your information</li>
                  <li>Cooperate with our verification process and respond promptly to requests for additional
                    information</li>
                  <li>Understand that providing false or misleading information may result in account closure and legal
                    action</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4 mb-4">
                  <strong>Your Rights:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Access your verification information and status</li>
                  <li>Request correction of inaccurate information (subject to regulatory requirements)</li>
                  <li>Understand why verification was rejected and how to correct it</li>
                  <li>File a complaint if you believe your verification was handled incorrectly</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Sharing with Partners and Authorities</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may share your KYC/KYB information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                  <li>
                    <strong>Licensed Financial Service Partners:</strong> We share necessary verification information
                    with our licensed partners who facilitate transactions, as required for regulatory compliance
                  </li>
                  <li>
                    <strong>Regulatory Authorities:</strong> We may be required to share information with financial
                    regulators, law enforcement, and other government authorities as required by law
                  </li>
                  <li>
                    <strong>Service Providers:</strong> We may use third-party service providers to assist with
                    verification, screening, and compliance checks, all of whom are bound by strict confidentiality
                    agreements
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  All sharing is conducted in accordance with applicable data protection laws and our{" "}
                  <Link href="/privacy" className="text-easner-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Security and Confidentiality</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your KYC/KYB information, including
                  encryption in transit and at rest, secure document storage, access controls, and regular security
                  audits. All information is handled in strict confidence and accessed only by authorized personnel
                  with a legitimate business need. Our compliance team is trained in data protection and confidentiality
                  requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this KYC/KYB Policy from time to time to reflect changes in regulations, our practices,
                  or our services. We will notify you of any material changes by posting the updated policy on our
                  website and updating the "Last updated" date. Continued use of our services after changes constitutes
                  acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about our KYC/KYB procedures, need assistance with verification, or wish to
                  update your information, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Easner, Inc.</strong>
                    <br />
                    Compliance Department
                    <br />
                    28 Geary St Ste 650
                    <br />
                    San Francisco, CA 94108
                    <br />
                    <strong>Email:</strong> compliance@easner.com
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

