"use client"

import { ArrowLeft } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AMLPolicyPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Anti-Money Laundering (AML) Policy</h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  Easner, Inc. ("Easner," "we," "us," or "our") is committed to preventing money laundering, terrorist
                  financing, and other financial crimes. As a technology platform facilitating financial services through
                  licensed partners, we maintain a comprehensive Anti-Money Laundering (AML) program designed to detect,
                  prevent, and report suspicious activities in accordance with applicable laws and regulations.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  This policy outlines our AML procedures, controls, and obligations. We conduct AML screening and
                  monitoring on all users and transactions. For information about our identity verification procedures,
                  please review our{" "}
                  <Link href="/kyc-policy" className="text-easner-primary hover:underline">
                    KYC/KYB Policy
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. What is Anti-Money Laundering (AML)?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Anti-Money Laundering (AML) refers to a set of laws, regulations, and procedures designed to prevent
                  criminals from disguising illegally obtained funds as legitimate income. Money laundering involves three
                  stages: placement (introducing illegal funds into the financial system), layering (concealing the
                  source of funds through complex transactions), and integration (making the funds appear legitimate).
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  AML regulations require financial service providers to implement controls to detect and prevent money
                  laundering activities, conduct customer due diligence, monitor transactions, and report suspicious
                  activities to relevant authorities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Our AML Program</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Easner maintains a comprehensive AML program that includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Customer Due Diligence (CDD):</strong> We verify the identity of all users through our KYC
                    procedures (see our{" "}
                    <Link href="/kyc-policy" className="text-easner-primary hover:underline">
                      KYC/KYB Policy
                    </Link>
                    )
                  </li>
                  <li>
                    <strong>Enhanced Due Diligence (EDD):</strong> We conduct enhanced screening for higher-risk
                    customers, including PEPs (Politically Exposed Persons), customers from high-risk jurisdictions, and
                    customers with unusual transaction patterns
                  </li>
                  <li>
                    <strong>Sanctions Screening:</strong> We screen all users and transactions against international
                    sanctions lists, including OFAC, UN, EU, and other relevant sanctions regimes
                  </li>
                  <li>
                    <strong>Transaction Monitoring:</strong> We monitor all transactions in real-time for suspicious
                    patterns, unusual activity, and potential money laundering indicators
                  </li>
                  <li>
                    <strong>Suspicious Activity Reporting:</strong> We file Suspicious Activity Reports (SARs) with
                    relevant authorities when we identify potentially suspicious transactions
                  </li>
                  <li>
                    <strong>Ongoing Monitoring:</strong> We continuously monitor customer relationships and transactions
                    for changes in risk profile or suspicious behavior
                  </li>
                  <li>
                    <strong>Record Keeping:</strong> We maintain comprehensive records of all transactions and customer
                    information as required by law
                  </li>
                  <li>
                    <strong>Training and Compliance:</strong> Our team receives regular training on AML regulations and
                    procedures
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Customer Due Diligence</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We conduct customer due diligence on all users, which includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Identity verification through our KYC procedures</li>
                  <li>Verification of beneficial owners for business customers</li>
                  <li>Assessment of customer risk profile</li>
                  <li>Understanding the nature and purpose of the customer relationship</li>
                  <li>Ongoing monitoring of transactions and account activity</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  For higher-risk customers, we conduct Enhanced Due Diligence (EDD), which may include additional
                  verification, source of funds verification, and more frequent monitoring.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sanctions Screening</h2>
                <p className="text-gray-700 leading-relaxed">
                  We screen all users and transactions against international sanctions lists, including but not limited
                  to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                  <li>Office of Foreign Assets Control (OFAC) sanctions (United States)</li>
                  <li>United Nations Security Council sanctions</li>
                  <li>European Union sanctions</li>
                  <li>United Kingdom sanctions</li>
                  <li>Other relevant sanctions regimes based on jurisdiction and transaction corridors</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We do not process transactions for individuals, entities, or countries subject to sanctions. If a match
                  is identified during screening, we will block the transaction and may be required to report it to
                  relevant authorities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Transaction Monitoring</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We monitor all transactions in real-time for indicators of suspicious activity, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Transactions that are unusually large or frequent</li>
                  <li>Transactions that appear to be structured to avoid reporting thresholds</li>
                  <li>Transactions involving high-risk jurisdictions</li>
                  <li>Transactions with no apparent economic or lawful purpose</li>
                  <li>Rapid movement of funds through multiple accounts</li>
                  <li>Transactions inconsistent with the customer's known profile or business</li>
                  <li>Transactions involving parties on sanctions lists or with adverse media</li>
                  <li>Unusual patterns of transactions that may indicate layering</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Our automated monitoring systems flag potentially suspicious transactions for review by our compliance
                  team. All flagged transactions undergo manual review and investigation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Suspicious Activity Reporting</h2>
                <p className="text-gray-700 leading-relaxed">
                  When we identify potentially suspicious activity, we are required by law to file a Suspicious Activity
                  Report (SAR) or similar report with the relevant financial intelligence unit or regulatory authority.
                  We may be required to file reports in multiple jurisdictions depending on the nature of the activity
                  and the jurisdictions involved.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Important:</strong> We are prohibited by law from informing you if we have filed a SAR or are
                  investigating suspicious activity. This is to prevent "tipping off" and to protect the integrity of
                  investigations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Risk-Based Approach</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We employ a risk-based approach to AML compliance, meaning we apply more stringent controls to
                  higher-risk customers and transactions. Risk factors we consider include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Customer Risk:</strong> PEP status, adverse media, sanctions exposure, country of
                    residence, business type
                  </li>
                  <li>
                    <strong>Transaction Risk:</strong> Transaction amount, frequency, destination country, currency
                    pair, transaction pattern
                  </li>
                  <li>
                    <strong>Product Risk:</strong> Complexity of the service, anonymity features, speed of settlement
                  </li>
                  <li>
                    <strong>Geographic Risk:</strong> Countries with weak AML controls, high levels of corruption, or
                    subject to sanctions
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Higher-risk customers and transactions receive enhanced due diligence, more frequent monitoring, and
                  may be subject to additional controls or restrictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. User Obligations</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As a user of Easner services, you have certain obligations under AML regulations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Provide Accurate Information:</strong> You must provide accurate, complete, and truthful
                    information about yourself, your transactions, and the source of your funds
                  </li>
                  <li>
                    <strong>Cooperate with Verification:</strong> You must cooperate with our KYC/KYB and AML
                    verification procedures
                  </li>
                  <li>
                    <strong>Report Changes:</strong> You must notify us immediately of any changes to your information
                    or circumstances that may affect your risk profile
                  </li>
                  <li>
                    <strong>Use Services Legitimately:</strong> You must use our services only for legitimate purposes
                    and not for money laundering, terrorist financing, or other illegal activities
                  </li>
                  <li>
                    <strong>Understand Restrictions:</strong> You must understand that we may restrict or refuse
                    transactions that we believe may be suspicious or violate AML regulations
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Consequences of Non-Compliance:</strong> Failure to comply with AML obligations may result in
                  account restrictions, transaction delays or refusals, account closure, and reporting to regulatory
                  authorities. Providing false or misleading information may also result in criminal prosecution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Transaction Limits and Restrictions</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may impose transaction limits or restrictions based on AML risk factors, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                  <li>Daily, weekly, or monthly transaction limits based on verification level and risk profile</li>
                  <li>Restrictions on transactions to or from high-risk jurisdictions</li>
                  <li>Additional verification requirements for large transactions</li>
                  <li>Temporary holds on transactions pending compliance review</li>
                  <li>Refusal of transactions that we believe may violate AML regulations</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  These limits and restrictions are designed to manage AML risk and comply with regulatory requirements.
                  We will notify you of any applicable limits or restrictions that affect your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Cooperation with Authorities</h2>
                <p className="text-gray-700 leading-relaxed">
                  We cooperate fully with regulatory authorities, law enforcement, and financial intelligence units in
                  the fight against money laundering and terrorist financing. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                  <li>Filing Suspicious Activity Reports and other required disclosures</li>
                  <li>Responding to information requests from regulatory authorities</li>
                  <li>Providing information in response to court orders and legal processes</li>
                  <li>Cooperating with investigations into financial crimes</li>
                  <li>Maintaining records as required for regulatory examinations</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We may be required to share information with authorities in multiple jurisdictions, depending on the
                  nature of the activity and applicable laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Record Keeping</h2>
                <p className="text-gray-700 leading-relaxed">
                  We maintain comprehensive records of all transactions, customer information, and AML activities as
                  required by law. Retention periods vary by jurisdiction but typically range from 5 to 7 years after
                  the closure of an account or the last transaction. In some cases, we may be required to retain
                  records for longer periods. All records are maintained securely and in accordance with applicable data
                  protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Training and Compliance</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our compliance team receives regular training on AML regulations, procedures, and emerging threats.
                  We conduct regular reviews and audits of our AML program to ensure effectiveness and compliance with
                  evolving regulatory requirements. We also work closely with our licensed financial service partners to
                  ensure consistent AML standards across our network.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this AML Policy from time to time to reflect changes in regulations, our practices, or
                  emerging threats. We will notify you of any material changes by posting the updated policy on our
                  website and updating the "Last updated" date. Continued use of our services after changes constitutes
                  acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about our AML procedures, need to report concerns, or wish to understand how AML
                  requirements affect your account, please contact us at:
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

