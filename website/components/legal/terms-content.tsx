import { LightsparkGridTermsContent } from "@/components/legal/lightspark-grid-terms-content"
import { PolicyContactBlock, PolicyExternalLink, PolicyLink, PolicyPageShell } from "@/components/legal/policy-page-shell"


export function TermsPolicyPage() {
  return (
    <PolicyPageShell title="Terms of Service" lastUpdated="August 12, 2026">
      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">1. Acceptance of Terms</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          By accessing or using Easner’s website, <strong>Easner Personal Banking</strong> (via our mobile app), <strong>Easner Business Banking</strong> (via our web dashboard), or related services (collectively, the <strong>“Services”</strong>), you agree to these Terms of Service (<strong>“Terms”</strong>). If you do not agree, do not use the Services.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          If you use the Services on behalf of a business, you represent that you have authority to bind that entity. <strong>“You”</strong> includes that entity and its authorized users.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Your use of the Services is also subject to our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> and <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>, each incorporated by reference.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">2. Electronic Communications and E-Sign</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You consent to receive account, transaction, security, and legal notices electronically – including by email, in-app messages, push notifications, and SMS where we use text messaging for service communications.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You agree that electronic records, disclosures, and click-through or in-app acceptance (including acceptance of these Terms when you create an account or sign in) satisfy applicable electronic signature and electronic contract requirements where permitted by law.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          You are responsible for keeping your contact information current so we can reach you with required notices.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">3. About Easner</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Easner Group, Inc.</strong> is a Delaware C-corporation that builds financial technology for global money movement.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We offer:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li><strong>Easner Personal Banking</strong> – consumer banking and payments through our mobile app</li>
          <li><strong>Easner Business Banking</strong> – business banking, payouts, payroll, collections, and online payments through our web dashboard</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Depending on your verification status, location, and product availability, the Services may include multi-currency accounts, inbound and outbound payments, currency conversion, stablecoin funding and settlement rails, invoicing and merchant collection tools, payroll disbursements, card-acceptance on invoices, and card products when available.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Service tiers (availability depends on verification, jurisdiction, and partner enablement):</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li><strong>Tier 1 – Global banking:</strong> USD and EUR accounts (and other currencies where enabled), pay-in and pay-out, regional corridors where launched, and stablecoin flows</li>
          <li><strong>Tier 2 – Cards:</strong> Personal or business cards, spend controls, and cardholder management <strong>when approved and launched</strong> (not generally available today)</li>
          <li><strong>Tier 3 – Online payments (Business Banking):</strong> Accept card payments on invoices via our payments partner, with settlement to your Easner balance when enabled</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Cross-border and local pay-in/pay-out corridors (for example mobile money or local bank rails in Africa, Latin America, Asia, and other regions) may be offered as part of Tier 1 for eligible global users and jurisdictions. Corridor availability depends on partners and destination – not a separate regional banking account product unless we expressly launch one.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          <strong>Important:</strong> Easner is a <strong>financial technology company, not a bank</strong>. Banking, money transmission, payment acceptance, verification, and card services made available through the Services are provided by <strong>licensed financial partners</strong> in their respective jurisdictions. Easner does not offer FDIC or equivalent deposit insurance and does not itself hold customer deposits. Partner disclosures presented during onboarding, in receipts, or in these Terms identify the regulated provider for the relevant service.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">4. The Services</h2>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Easner Personal Banking</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          For individuals, the Services may include account registration, identity verification, sending and receiving money, currency accounts and conversion, virtual account and stablecoin receive options, recipients, <strong>EASETAG</strong> transfers, mobile-money and local corridor flows where enabled, payroll receiving where invited by an employer, transaction history, and security features such as multi-factor authentication and biometric unlock where supported. Intended for consumers <strong>18 or older</strong> in supported jurisdictions.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Card products shown in the app may be labeled coming soon and are <strong>not</strong> available until we launch Tier 2 cards with a licensed partner.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Easner Business Banking</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          For businesses, the Services may include organization onboarding, team access controls, multi-currency accounts, fund-balance and payouts (including cross-border corridors where enabled), <strong>payroll</strong> (people, runs, and disbursements), <strong>collections</strong> (invoicing, payment Terminal, and QR Pay where enabled), <strong>online payments</strong> (card acceptance on invoices via Stripe Connect where enabled), customer directory, wallet and stablecoin sends where enabled, and reporting. The account owner is responsible for authorized users’ actions.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Partner-provided financial services</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Identity verification, virtual accounts, fiat pay-in and pay-out, money transmission, card acceptance, sanctions screening, and related compliance processing are delivered by <strong>licensed partners</strong>. Easner provides the technology interface and program management.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          When you use partner-provided services, you may need to accept <strong>separate partner terms and privacy notices</strong> in the onboarding flow (or via these Terms). Those terms govern the regulated services the partner provides and are incorporated by reference to the extent they apply to your use through Easner. Our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> identifies key financial and infrastructure partners.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Lightspark Grid.</strong> When you use <strong>Lightspark money-transmission services</strong> through Easner (including certain Business KYB, virtual account, fund, payout, or cross-border flows when Grid is enabled for your account), the <strong>Lightspark Grid End User Terms</strong> in <strong>Section 20</strong> below also apply and form part of your agreement for those regulated services. <strong>Lightspark Payments, LLC</strong> (NMLS ID 2429193) is the licensed money transmitter on those transactions.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Noah.</strong> When you use <strong>Noah money-transmission and related payment services</strong> through Easner (including identity verification, virtual accounts, fiat pay-in and pay-out, and certain corridors where Noah is enabled for your account – including many <strong>Easner Personal Banking</strong> flows today), Noah’s partner terms and privacy notices presented during onboarding also apply and form part of your agreement for those regulated services. <strong>Noah US, Inc.</strong> (NMLS ID 2696057) is a licensed money transmitter for applicable U.S. money-transmission services. Noah-group entities in other jurisdictions (for example Canada MSB registration and EU/Lithuania VASP registration) may provide services under their local licenses. Those terms govern the regulated services Noah provides.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Yellowcard.</strong> When you use <strong>Yellowcard</strong> corridor services through Easner (including local fund-balance, mobile-money, and cross-border pay-in/pay-out where Yellowcard is enabled for your account), Yellowcard’s partner terms and privacy notices presented during onboarding or in the payment flow also apply and form part of your agreement for those regulated services. Yellowcard is the licensed payments / money-movement partner on those corridor transactions. Those terms govern the regulated services Yellowcard provides.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Stripe.</strong> When you enable <strong>online payments</strong> / Stripe Connect for invoice card acceptance, Stripe’s Connected Account Agreement, Stripe Services Agreement, and related Stripe terms apply to card acceptance and settlement, in addition to these Terms.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Online payments and Stripe Connect (Business)</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Where enabled, Easner Business Banking may let you accept <strong>card payments on invoices</strong> through <strong>Stripe Connect</strong>. Funds are processed by Stripe and, when settlement succeeds, credited toward your eligible Easner balance subject to Stripe and Easner timing, fees, holds, and compliance reviews.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          By enabling online payments you represent that:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>You will only charge for legitimate goods or services you are authorized to sell</li>
          <li>You will comply with card-network rules, Stripe’s prohibited and restricted business lists, and applicable consumer and tax law</li>
          <li>You are responsible for refunds, disputes, and <strong>chargebacks</strong> related to your invoice payments, including any amounts Stripe or Easner debits or reserves from your balances</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Easner may suspend online payments, withhold settlement, or require additional information if Stripe, a card network, or our compliance program flags risk.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Payroll (Business and invited employees)</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Where enabled, businesses may run payroll and disburse wages or contractor payments to eligible recipients (including employees invited to receive via Easner Personal Banking). You are solely responsible for employment classification, wage-and-hour compliance, tax withholding and reporting, and accurate payroll instructions. Easner does not act as your employer of record or tax advisor.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Digital asset and wallet services</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Where enabled, wallet and stablecoin features may be supported through infrastructure partners (including Turnkey for key management and signing, and approved bridge or routing partners for certain wallet sends). This can include stablecoin deposit addresses (for example USDC or EURC on supported networks), wallet-initiated sends through approved corridors (primarily on <strong>Easner Business Banking</strong>), Terminal and QR Pay collections denominated in supported assets, and balance visibility tied to partner-managed infrastructure.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Digital asset balances are <strong>not bank deposits</strong> and are not FDIC insured. Blockchain transactions may be public and irreversible. You are responsible for correct addresses, memos, and recipient details.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Self-custody wallets and flow of funds</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          For Turnkey-backed wallet features, <strong>Easner does not sit in the flow of funds</strong> as a custodian or signing party. Specifically:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>We do not sign or co-sign user transactions.</li>
          <li>We do not hold, custody, or export users’ private keys or seed phrases.</li>
          <li>Wallet keys and signing are managed within <strong>Turnkey’s</strong> secure infrastructure, not by Easner – Turnkey governs key generation and transaction signing.</li>
          <li>Easner controls access to our product (that is, who can initiate actions through our UI/API), but we are <strong>not a custodian</strong> and <strong>not a signing party</strong> on any transaction.</li>
          <li>Any “block” on our side is only <strong>product access control</strong> (for example verification, security, or compliance gating in the app). It is not the ability to alter, cancel, or reverse a transaction once it has been signed and submitted.</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Fiat money-transmission, virtual-account, and partner payout rails (including <strong>Lightspark Grid</strong>, <strong>Noah</strong>, and <strong>Yellowcard</strong> where enabled) remain separate from this self-custody wallet model and are provided by those licensed partners under their terms.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Cards</h3>
        <p className="text-[#5F665F] leading-relaxed">
          When Tier 2 cards are offered, they will be issued or facilitated by a <strong>licensed card program partner</strong> under a separate cardholder or program agreement, subject to partner underwriting and jurisdiction. Until launch, any cards screens in the Services are informational only.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">5. Eligibility</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          To use the Services you must:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Be at least <strong>18 years old</strong></li>
          <li>Reside in or operate from a <strong>supported jurisdiction</strong> as described in our KYC/KYB and AML Policy</li>
          <li>Not be in a <strong>prohibited or controlled</strong> jurisdiction, comprehensively sanctioned territory, or any location where use of the Services is unlawful</li>
          <li>Provide accurate registration information and complete required <strong>KYC</strong> or <strong>KYB</strong></li>
          <li>Keep your credentials and devices secure</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed">
          We may refuse, suspend, or close accounts that do not meet eligibility or compliance standards. Sanctions screening applies to all users regardless of country. Currency, corridor, and tier availability depend on partners and your verification status.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">6. Your Responsibilities</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Provide accurate, complete, and current information</li>
          <li>Use the Services lawfully and in line with AML, sanctions, tax, employment, and consumer-protection obligations</li>
          <li>Protect passwords, PINs, and authentication factors</li>
          <li>Notify us promptly of unauthorized access or suspected fraud</li>
          <li>Ensure payouts, invoices, payroll, online payments, and collections reflect legitimate activity</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Business users</strong> must maintain accurate ownership and signatory information, control team access, and use collections, payroll, and online-payment features in compliance with applicable law (including card-network and Stripe rules where enabled).
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          We share information with partners and service providers only as needed to deliver the Services. We do not sell your personal information.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">7. Fees and Exchange Rates</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Fees, charges, and exchange rates may apply</strong> depending on product, corridor, currency pair, payment method, and partner costs (including Stripe processing fees for online payments and partner corridor fees). Applicable fees and rates are <strong>shown before you confirm</strong> a transaction or enable a feature unless otherwise required by law.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Rates may include a margin relative to reference or partner pricing. Third-party fees (bank charges, network fees, card scheme fees, on-chain gas) may also apply.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          We may change fees with notice as described in Section 16.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">8. Payments, Settlement, and Reversals</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Once you confirm a transaction, it may be <strong>final and irreversible</strong> after processing – especially on blockchain networks and certain partner settlement rails.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Refunds and reversals</strong> are provided only where required by law, partner rules, card-network rules, or Easner policy. They are not guaranteed.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Chargebacks and payment disputes</strong> initiated with a cardholder’s bank, Stripe, or another payment provider regarding invoice payments, funded payments, or collections may result in account holds, debits from your Easner or Stripe balances, reserves, suspension, or closure.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Partner and network processing times shown in the Services are estimates, not guarantees.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">9. Compliance, Limits, and Holds</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Transaction limits, feature access, and corridor availability depend on verification tier, destination, partner rules, and your risk profile. We and our partners may delay, hold, decline, or request additional information to meet KYC, KYB, AML, sanctions, and card-acceptance obligations. See our <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          We or our partners may request <strong>source of funds, purpose of payment, or supporting documentation</strong> for high-value or higher-risk transactions before releasing funds.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">10. Availability</h2>
        <p className="text-[#5F665F] leading-relaxed">
          Services vary by jurisdiction and depend on partner capabilities, maintenance, and network conditions. Processing times are estimates, not guarantees. Preview, coming-soon, or beta features may change or be withdrawn without becoming a contractual commitment to launch.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">11. Privacy</h2>
        <p className="text-[#5F665F] leading-relaxed">
          Our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> describes how we collect, use, and protect personal information. By using the Services, you consent to those practices and to processing required by partners for compliance and payment acceptance.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">12. Prohibited Use</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You may not use the Services to violate law, evade sanctions, launder money, finance terrorism, commit fraud, structure transactions to avoid monitoring, act as an unauthorized money transmitter, submit false information, abuse the platform, process prohibited card transactions, or engage in restricted merchant activity.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          We may report suspicious activity as required by law and may not notify you when doing so.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">13. Disclaimers</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          THE SERVICES ARE PROVIDED <strong>“AS IS”</strong> AND <strong>“AS AVAILABLE”</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Easner is not a bank, exchange, employer of record, payment facilitator for unapproved activity, or asset custodian beyond what our infrastructure partners provide under their terms. Regulated financial products are provided by licensed partners. Easner does not provide investment, tax, employment, or legal advice. Information in the Services is general in nature only.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">14. Limitation of Liability</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, EASNER AND ITS AFFILIATES SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS, DATA, USE, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICES.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          EASNER’S TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE GREATER OF (A) FEES YOU PAID TO EASNER FOR THE RELEVANT SERVICE IN THE TWELVE (12) MONTHS BEFORE THE EVENT, OR (B) ONE HUNDRED U.S. DOLLARS (US $100), EXCEPT WHERE LIABILITY CANNOT BE LIMITED BY LAW.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          REGULATED SERVICES ARE PERFORMED BY THIRD-PARTY PARTNERS. EASNER IS NOT LIABLE FOR PARTNERS’ ACTS OR OMISSIONS EXCEPT AS REQUIRED BY LAW.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">15. Termination</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We may suspend or terminate access if you breach these Terms, pose a compliance or security risk, or if required by law or a partner. You may stop using the Services at any time.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Easner Personal Banking</strong> users can close their account in the mobile app as described on our <PolicyLink href="/delete-account">Delete Account</PolicyLink> page, including a 7-day grace period during which signing in cancels the pending closure. If you cannot access the app, email <strong>support@easner.com</strong> or <strong>legal@easner.com</strong>. Business account closure may require additional steps (for example settling balances, payroll, or open invoices).
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Surviving provisions include fees owed, chargeback and settlement obligations, dispute terms, and record retention obligations.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">16. Changes</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We may modify these Terms. Material changes will receive at least <strong>30 days’ notice</strong> before taking effect. Continued use after the effective date constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">17. Governing Law and Disputes</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Governing law:</strong> State of Delaware, USA, without regard to conflict-of-law rules, except where mandatory consumer protections in your country apply.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Informal resolution:</strong> Contact <strong>legal@easner.com</strong> and allow <strong>60 days</strong> to resolve disputes in good faith before arbitration or court action.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Arbitration:</strong> Disputes not resolved informally shall be settled by <strong>binding arbitration</strong> administered by the <strong>AAA</strong> under Consumer Arbitration Rules (individual users of Easner Personal Banking) or Commercial Arbitration Rules (Easner Business Banking and commercial use). Seat: <strong>Wilmington, Delaware</strong>, or remote by agreement. The <strong>Federal Arbitration Act</strong> applies.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Class and jury waiver:</strong> Disputes proceed <strong>only on an individual basis</strong> to the extent permitted by law. You and Easner waive jury trial for covered disputes.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Opt-out:</strong> Within <strong>30 days</strong> of first accepting these Terms, send written notice to <strong>legal@easner.com</strong> to opt out of arbitration.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Exceptions:</strong> Either party may use <strong>small claims court</strong> for qualifying claims or seek <strong>injunctive relief</strong> for unauthorized use or intellectual property abuse.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          <strong>Partner disputes:</strong> Claims arising solely from a partner’s regulated services (including Lightspark money transmission, Noah money transmission, Yellowcard corridor payments, or Stripe card acceptance) may be subject to that partner’s dispute process.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">18. General Provisions</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Entire agreement:</strong> These Terms (including <strong>Section 20 – Lightspark Grid End User Terms</strong> where those services apply), together with the incorporated <PolicyLink href="/privacy">Privacy Policy</PolicyLink> and <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>, constitute the entire agreement between you and Easner regarding the Services. Lightspark’s End User Terms govern your direct relationship with Lightspark for Grid money-transmission services. Noah’s partner terms govern your relationship with Noah for Noah money-transmission and related payment services where enabled. Yellowcard’s partner terms govern Yellowcard corridor payments where enabled. Stripe’s Connected Account and related agreements govern card acceptance where you enable online payments.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Severability:</strong> If any provision is held invalid or unenforceable, the remaining provisions remain in effect.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written consent. Easner may assign these Terms in connection with a merger, acquisition, corporate reorganization, or sale of assets.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          <strong>Force majeure:</strong> Easner is not liable for delays or failures caused by events beyond our reasonable control, including partner outages, banking hours, card-network outages, network or blockchain failures, acts of government, or regulatory action.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">19. Contact</h2>
        <PolicyContactBlock />
      </section>
      <section id="lightspark-money-transmission">
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">20. Lightspark Grid End User Terms</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          When you use money-transmission, payout, pay-in, currency conversion, or related Grid services provided by <strong>Lightspark Payments, LLC</strong> (NMLS ID 2429193) through Easner (the Platform), you also agree to the full Lightspark Grid End User Terms below. Easner presents these terms as part of this combined document so that accepting Easner’s Terms includes accepting Lightspark’s End User Terms for those services. The current Lightspark-hosted copy is also available at{" "}
          <PolicyExternalLink
            href="https://www.lightspark.com/legal/grid/enduserterms"
            analyticsLocation="legal_lightspark_terms"
          >
            https://www.lightspark.com/legal/grid/enduserterms
          </PolicyExternalLink>
          . In the event Lightspark updates its End User Terms, the then-current version Lightspark publishes governs those regulated services, and Easner will update this Section 20 accordingly.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          <strong>Source:</strong> Lightspark Grid End User Terms (as published by Lightspark). Reproduced below in full for combined acceptance.
        </p>
        <div className="mt-8 border-t border-[#E4DED1] pt-8">
          <LightsparkGridTermsContent />
        </div>
      </section>
    </PolicyPageShell>
  )
}
