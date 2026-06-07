import { PolicyContactBlock, PolicyLink, PolicyPageShell, PolicyTable } from "@/components/legal/policy-page-shell"

export function PrivacyPolicyPage() {
  return (
    <PolicyPageShell title="Privacy Policy" lastUpdated="June 8, 2026">
      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">1. Introduction</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          This Privacy Policy explains how <strong>Easner Group, Inc.</strong> (&quot;<strong>Easner</strong>,&quot;
          &quot;<strong>we</strong>,&quot; &quot;<strong>us</strong>,&quot; or &quot;<strong>our</strong>&quot;) collects,
          uses, shares, and protects information when you use:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>www.easner.com</li>
          <li>
            <strong>Easner Personal</strong> (mobile application)
          </li>
          <li>
            <strong>Easner Business</strong> (web dashboard)
          </li>
          <li>Public invoice and payment experiences we host for business users</li>
          <li>Related support and communications channels</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed">
          Easner is a financial technology company. We work with <strong>licensed partners</strong> to deliver banking
          and payment services described in our Terms of Service. This policy covers <strong>account holders</strong> and,
          where noted, <strong>business customers and payers</strong> whose data business users submit through collections
          tools.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">2. Information We Collect</h2>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>You provide:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            Account and profile details (name, email, phone, country, credentials, <strong>EASETAG</strong> @handle,
            profile photo)
          </li>
          <li>
            Identity and business verification data (government ID, date of birth, address, tax identifiers, business
            registration, beneficial ownership, selfies or liveness where required)
          </li>
          <li>
            Financial and transaction data (accounts, payment instructions, amounts, currencies, counterparties, source of
            funds, payment or transfer notes)
          </li>
          <li>
            Recipients, customers, and collections data (invoice recipients, Terminal and QR Pay payer references, wallet
            addresses)
          </li>
          <li>Support communications (email, phone, in-app live chat, including voice messages you choose to send)</li>
          <li>Files you upload (for example transfer receipts or compliance documents)</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>We collect automatically:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            Device, app, and usage data (IP address, device model and OS, app version, locale, logs, feature usage, screen
            and product analytics events, session timestamps, deep links opened in the app)
          </li>
          <li>
            Security and diagnostic data (authentication events, fraud indicators, error and crash reports, performance
            signals where logged)
          </li>
          <li>Approximate location from IP or device region where used for security, fraud prevention, or compliance</li>
          <li>
            Account-linked product analytics to understand how the Services are used and to improve them — this may be
            associated with your user account; we do not use it for cross-app or cross-website advertising
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Mobile app permissions (where you grant them):</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            <strong>Camera</strong> — government ID, selfie/liveness for verification, or photos you choose to capture
            in-app
          </li>
          <li>
            <strong>Photo library</strong> — profile avatar or attachments you select
          </li>
          <li>
            <strong>Microphone</strong> — voice messages in live chat when you choose to record audio
          </li>
          <li>
            <strong>Push notifications</strong> — device tokens and delivery metadata for account and security alerts you
            enable
          </li>
          <li>
            <strong>Face ID or biometric unlock</strong> — processed on your device to unlock the app; Easner does not
            receive or store your biometric templates
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Sign-in services (where you use them):</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            <strong>Sign in with Apple</strong> or <strong>Sign in with Google</strong> — we receive authentication
            tokens and basic profile fields (such as name and email) as permitted by those providers and your choices.
            Their privacy policies govern data they collect independently.
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Partners provide:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            Verification outcomes, account identifiers, settlement data, and compliance screening results from licensed
            financial and infrastructure partners
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Wallet and blockchain:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            Deposit addresses, memos, token types, balances, transaction hashes, and related metadata where wallet or
            stablecoin features are enabled
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Mobile app — data we do not collect:</strong>
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          The Easner mobile app does not read your device address book, email or SMS inboxes, or precise GPS location, and
          does not collect browsing or search history for advertising.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">3. How We Use Information</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">We use information to:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Provide, operate, and improve the Services</li>
          <li>Process payments and collections through partners</li>
          <li>Verify identity and business eligibility</li>
          <li>Detect, prevent, and investigate fraud and financial crime</li>
          <li>Meet legal and regulatory obligations (KYC, KYB, AML, sanctions)</li>
          <li>Communicate about your account and service updates</li>
          <li>Provide support and enforce our Terms and policies</li>
          <li>Measure product performance and diagnose errors through analytics and logging tools</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed">
          We may use aggregated or de-identified data where appropriate. We <strong>do not sell</strong> personal
          information and <strong>do not use</strong> personal information for cross-context behavioral advertising or
          tracking you across third-party apps and websites for ads.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">4. How We Share Information</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">We may share information:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F]">
          <li>With your direction or consent</li>
          <li>
            With <strong>licensed financial and infrastructure partners</strong> to provide verification, accounts,
            payments, wallet services, and compliance screening
          </li>
          <li>With service providers (hosting, email, analytics, support tools) under contract</li>
          <li>To comply with law, regulation, legal process, or government request</li>
          <li>To protect Easner, users, or the public</li>
          <li>In connection with a merger, acquisition, or asset sale, subject to safeguards</li>
          <li>With regulators and law enforcement as required</li>
        </ul>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">5. Service Providers and Partners</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We engage partners who process data on our behalf or under their own regulatory obligations, including providers
          of hosted KYC/KYB, virtual accounts, fiat payments, wallet infrastructure, transaction routing, and regional
          payout services.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          When you complete hosted verification, the partner processes documents on our behalf and shares results with
          Easner. Partner terms and privacy notices may be presented during onboarding. Partners may retain data as
          required by their regulatory duties.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Key financial and infrastructure partners</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Depending on your product, jurisdiction, and features enabled, we work with partners including:
        </p>
        <PolicyTable
          headers={["Partner", "Role"]}
          rows={[
            [
              "Noah",
              "Hosted KYC/KYB, virtual accounts, fiat pay-in and pay-out, and related compliance processing",
            ],
            [
              "Turnkey",
              "Wallet and key-management infrastructure, deposit addresses, and transaction signing",
            ],
            ["LI.FI", "Transaction routing and execution for permitted wallet sends (where enabled)"],
            ["Yellowcard", "African payout corridors (where Tier 2 banking is launched)"],
          ]}
        />
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2 mt-6">Technology and support service providers</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">We also use service providers under contract, including:</p>
        <PolicyTable
          headers={["Provider", "Role"]}
          rows={[
            ["Supabase", "Authentication, database, and session storage"],
            ["PostHog", "Product analytics, feature usage, and error or diagnostic events"],
            ["Intercom", "In-app customer support and live chat"],
          ]}
        />
        <p className="text-[#5F665F] leading-relaxed mb-4">
          When you use <strong>Sign in with Apple</strong> or <strong>Sign in with Google</strong>, those companies
          process authentication data under their own privacy policies.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Additional partners and providers may be disclosed when you enable a specific feature or during onboarding.
          Partner and provider lists may change as our Services evolve; material changes will be reflected in this policy.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">6. Security</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We use technical and organizational measures — including encryption in transit and at rest where appropriate,
          access controls, and monitoring — designed to protect personal information. No system is perfectly secure. You
          are responsible for safeguarding your devices and credentials.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">7. Retention</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We retain information as long as needed to provide the Services and meet legal obligations. Financial services
          recordkeeping often requires <strong>5 to 7 years</strong> or longer after account closure or last activity.
          Partners may retain records under their own obligations after your account closes.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">8. Your Rights</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Depending on where you live, you may have rights to access, correct, delete, restrict, or port your information,
          or object to certain processing. Financial regulations may limit some requests.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Contact{" "}
          <a href="mailto:legal@easner.com" className="text-easner-primary hover:underline">
            legal@easner.com
          </a>
          ,{" "}
          <a href="mailto:support@easner.com" className="text-easner-primary hover:underline">
            support@easner.com
          </a>
          , or in-app live chat. If a partner holds verification data, contact us first and we will coordinate where
          appropriate.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">California residents (CCPA / CPRA)</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We collect the categories described in Section 2 for the business purposes in Section 3.{" "}
          <strong>We do not sell personal information</strong> or share it for cross-context behavioral advertising. This
          includes data processed through product analytics tools that may be linked to your account.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You may have rights to know, access, correct, and delete personal information, and to limit use of sensitive
          personal information. Submit requests to{" "}
          <a href="mailto:legal@easner.com" className="text-easner-primary hover:underline">
            legal@easner.com
          </a>{" "}
          or{" "}
          <a href="mailto:support@easner.com" className="text-easner-primary hover:underline">
            support@easner.com
          </a>{" "}
          with &quot;California Privacy Request&quot; in the subject line. We will verify identity as permitted by law.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">EEA, UK, and similar jurisdictions</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We process data based on <strong>contract</strong> (providing the Services), <strong>legal obligation</strong>{" "}
          (compliance), <strong>legitimate interests</strong> (security and improvement, balanced against your rights), and{" "}
          <strong>consent</strong> where required.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You may have rights to access, rectify, erase, restrict, object, and port data, and to complain to your
          supervisory authority. International transfers may rely on safeguards such as Standard Contractual Clauses where
          required.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          For account holder data, <strong>Easner Group, Inc.</strong> is the controller. For invoice or payer data
          submitted by business users, Easner typically acts as a <strong>processor</strong> on the business user&apos;s
          behalf.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">9. Cookies</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We use cookies and similar technologies on our website and dashboard for authentication, preferences, security,
          and analytics. You can manage cookies in browser settings; disabling them may affect functionality. Where
          required by law, we will obtain consent for non-essential cookies.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">10. International Transfers</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We are headquartered in the United States. Information may be processed in the U.S. and other countries where we
          or partners operate, with appropriate safeguards where required.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">11. Children</h2>
        <p className="text-[#5F665F] leading-relaxed">
          The Services are not directed to anyone under <strong>18</strong>. We do not knowingly collect children&apos;s
          personal information.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">12. Digital Assets</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Where enabled, we may provision stablecoin capabilities such as <strong>USDC</strong> and <strong>EURC</strong> on
          supported networks.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Wallet addresses, memos or tags, and transaction hashes may be <strong>publicly visible on blockchain
          networks</strong>. Easner and our partners do not control public blockchains.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You are responsible for providing correct wallet addresses, memos, and recipient details. Errors may result in
          permanent loss of funds.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          The regulatory treatment of digital assets <strong>varies by jurisdiction</strong>.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Digital assets are <strong>not bank deposits</strong> and are not FDIC insured. Transactions may be irreversible.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">13. Business Customers and Payers</h2>
        <p className="text-[#5F665F] leading-relaxed">
          Business users may submit customer or payer information for invoicing and collections. You represent that you have
          a lawful basis to provide that data. Business users are typically controllers of their customer relationships;
          Easner processes the data to deliver collections and compliance functions.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">14. Compliance</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We and our partners are subject to KYC, KYB, AML, and sanctions requirements. See our{" "}
          <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">15. Changes and Contact</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We may update this policy by posting a revised version with an updated &quot;Last updated&quot; date. Material
          changes may receive additional notice where required.
        </p>
        <PolicyContactBlock />
      </section>
    </PolicyPageShell>
  )
}
