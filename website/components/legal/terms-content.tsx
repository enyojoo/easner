import { PolicyContactBlock, PolicyLink, PolicyPageShell } from "@/components/legal/policy-page-shell"

export function TermsPolicyPage() {
  return (
    <PolicyPageShell title="Terms of Service" lastUpdated="June 8, 2026">
      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">1. Acceptance of Terms</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          By accessing or using Easner&apos;s website, <strong>Easner Mobile</strong> (mobile application for{" "}
          <strong>Easner Personal Banking</strong>), <strong>Easner Business</strong> (web dashboard for{" "}
          <strong>Easner Business Banking</strong>), <strong>Easner for Partners</strong> (commercial partner program
          materials, sandbox or API credentials, branded deployments, or other program features made available under a
          commercial relationship with Easner), or related services (collectively, the{" "}
          <strong>&quot;Services&quot;</strong>), you agree to these Terms of Service (<strong>&quot;Terms&quot;</strong>
          ). If you do not agree, do not use the Services.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          If you use the Services on behalf of a business, you represent that you have authority to bind that entity.{" "}
          <strong>&quot;You&quot;</strong> includes that entity and its authorized users.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Self-serve use of <strong>Easner Mobile</strong> and <strong>Easner Business</strong> is governed by these
          Terms. <strong>Easner for Partners</strong> engagements may also require a{" "}
          <strong>separate written commercial agreement</strong> (order form, MSA, or similar). If there is a conflict,
          the signed commercial agreement controls for that engagement; these Terms still apply where not superseded.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Your use of the Services is also subject to our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> and{" "}
          <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>, each incorporated by reference.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">2. Electronic Communications and E-Sign</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You consent to receive account, transaction, security, and legal notices electronically – including by email,
          in-app messages, and SMS where we use text messaging for service communications.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You agree that electronic records, disclosures, and click-through or in-app acceptance satisfy applicable
          electronic signature and electronic contract requirements where permitted by law.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          You are responsible for keeping your contact information current so we can reach you with required notices.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">3. About Easner</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Easner Group, Inc.</strong> is a Delaware C-corporation that builds financial technology for global
          money movement.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">We offer:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            <strong>Easner Mobile</strong> (<strong>Easner Personal Banking</strong>) – consumer banking and payments
            through our mobile app
          </li>
          <li>
            <strong>Easner Business</strong> (<strong>Easner Business Banking</strong>) – business banking, payouts,
            and collections through our web dashboard
          </li>
          <li>
            <strong>Easner for Partners</strong> – commercial programs for qualified organizations, including the{" "}
            <strong>Agency Model</strong> (branded OTC, money transfer, and faith-based or nonprofit network products on
            Easner infrastructure) and the <strong>Developer Model</strong> (API, webhooks, and embedded integrations
            to Easner rails)
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Easner for Partners</strong> is not self-serve account opening. Access is subject to commercial
          onboarding and approval.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Depending on your verification status, location, and product tier, the Services may include multi-currency
          accounts, inbound and outbound payments, currency conversion, stablecoin funding and settlement rails,
          invoicing and merchant collection tools, and card products when available.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Service tiers:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            <strong>Tier 1 – Global banking:</strong> USD and EUR accounts (and other currencies where enabled), pay-in
            and pay-out, and stablecoin flows
          </li>
          <li>
            <strong>Tier 2 – African banking:</strong> NGN and regional pay-in and pay-out where we launch
          </li>
          <li>
            <strong>Tier 3 – Cards:</strong> Personal or corporate cards, spend controls, and cardholder management when
            approved
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed">
          <strong>Important:</strong> Easner is a <strong>financial technology company, not a bank</strong>. Banking,
          payment, verification, and card services made available through the Services are provided by{" "}
          <strong>licensed financial partners</strong> in their respective jurisdictions. Easner does not offer FDIC or
          equivalent deposit insurance and does not itself hold customer deposits. Partner disclosures presented during
          onboarding identify the regulated provider for the relevant service.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">4. The Services</h2>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Easner Mobile (Easner Personal Banking)</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          For individuals, the Services may include account registration, identity verification, sending and receiving
          money, currency accounts and conversion, virtual account and stablecoin receive options, recipients, EASETAG
          transfers, open banking and mobile money flows where enabled, transaction history, and security features such as
          multi-factor authentication and biometric unlock where supported. Intended for consumers{" "}
          <strong>18 or older</strong> in supported jurisdictions.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Easner Business (Easner Business Banking)</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          For businesses, the Services may include organization onboarding, team access controls, payouts,
          multi-currency accounts, <strong>collections</strong>{" "}(invoicing, payment terminal, and QR Pay where enabled),
          customer directory, and reporting. The account owner is responsible for authorized users&apos; actions.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Easner for Partners</h3>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Agency Model:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            Branded customer-facing experiences (portals, flows, or co-branded UI) operated by the partner entity
          </li>
          <li>
            Compliance, corridor, and operational support provided by Easner as described in the commercial agreement
          </li>
          <li>
            The partner remains responsible for its brand, end-user communications, and lawful use of the deployment
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Developer Model:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            REST/API access, webhooks, and sandbox and production credentials after commercial onboarding
          </li>
          <li>
            The partner builds its own product UX; Easner provides rails, verification hooks, and compliance integration
            points
          </li>
          <li>
            The partner is responsible for securing API keys, lawful collection of end-user data, and passing required
            KYC/KYB where the partner onboards its own customers
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          End users of a partner&apos;s branded product or API integration may be subject to{" "}
          <strong>partner terms</strong> in addition to Easner and provider disclosures presented at transaction time.
          Regulated money movement still flows through <strong>licensed partners</strong>; Easner provides technology and
          program management.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Partner-provided financial services</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Identity verification, virtual accounts, fiat pay-in and pay-out, sanctions screening, and related compliance
          processing are delivered by <strong>licensed partners</strong>. Easner provides the technology interface and
          program management.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          When you use partner-provided services, you may need to accept <strong>separate partner terms and privacy
          notices</strong> in the onboarding flow. Those terms govern the regulated services the partner provides and are
          incorporated by reference to the extent they apply to your use through Easner. Our{" "}
          <PolicyLink href="/privacy">Privacy Policy</PolicyLink> identifies key financial and infrastructure partners
          (including Noah, Turnkey, LI.FI, and Yellowcard where applicable).
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Digital asset and wallet services</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Where enabled, wallet and stablecoin features may be supported through infrastructure partners. This can include
          stablecoin deposit addresses (for example USDC or EURC on supported networks), wallet-initiated sends through
          approved corridors (primarily on <strong>Easner Business</strong>), and balance visibility tied to
          partner-managed infrastructure.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Digital asset balances are <strong>not bank deposits</strong> and are not FDIC insured. Blockchain transactions
          may be public and irreversible. You are responsible for correct addresses, memos, and recipient details.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Cards</h3>
        <p className="text-[#5F665F] leading-relaxed">
          When Tier 3 cards are offered, they will be issued or facilitated by a <strong>licensed card program
          partner</strong> under a separate cardholder or program agreement, subject to partner underwriting and
          jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">5. Eligibility</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">To use the Services you must:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Be at least <strong>18 years old</strong></li>
          <li>
            Reside in or operate from a <strong>supported jurisdiction</strong> as described in our{" "}
            <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>
          </li>
          <li>
            Not be in a <strong>prohibited or controlled</strong> jurisdiction, comprehensively sanctioned territory, or
            any location where use is unlawful
          </li>
          <li>Provide accurate registration information and complete required <strong>KYC</strong> or <strong>KYB</strong></li>
          <li>Keep your credentials and devices secure</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed">
          We may refuse, suspend, or close accounts that do not meet eligibility or compliance standards. Sanctions
          screening applies to all users regardless of country. Currency, corridor, and tier availability depend on
          partners and your verification status.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">6. Your Responsibilities</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">You agree to:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Provide accurate, complete, and current information</li>
          <li>Use the Services lawfully and in line with AML, sanctions, and tax obligations</li>
          <li>Protect passwords, PINs, and authentication factors</li>
          <li>Notify us promptly of unauthorized access or suspected fraud</li>
          <li>Ensure payouts, invoices, and collections reflect legitimate activity</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Business users</strong> must maintain accurate ownership and signatory information, control team
          access, and use collections features in compliance with applicable law.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Easner for Partners participants</strong> must:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Maintain accurate program and entity information and authorized integrators</li>
          <li>Not misrepresent Easner as the bank or regulated provider</li>
          <li>
            For the Developer Model: protect credentials, respect rate limits, and comply with API use restrictions in the
            commercial agreement
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed">
          We share information with partners and service providers only as needed to deliver the Services. We do not sell
          your personal information.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">7. Fees and Exchange Rates</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Fees, charges, and exchange rates may apply</strong> depending on product, corridor, currency pair,
          and partner costs. Applicable fees and rates are <strong>shown before you confirm</strong> a transaction unless
          otherwise required by law.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Rates may include a margin relative to reference or partner pricing. Third-party fees (bank charges, network
          fees, on-chain gas) may also apply.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          We may change fees with notice as described in Section 16.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">8. Payments, Settlement, and Reversals</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Once you confirm a transaction, it may be <strong>final and irreversible</strong> after processing – especially
          on blockchain networks and certain partner settlement rails.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Refunds and reversals</strong> are provided only where required by law, partner rules, or Easner
          policy. They are not guaranteed.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Chargebacks</strong> and disputes initiated with your bank or payment provider regarding funded
          payments may result in account holds, debits, suspension, or closure.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Partner and network processing times shown in the Services are estimates, not guarantees.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">9. Compliance, Limits, and Holds</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Transaction limits, feature access, and corridor availability depend on verification tier, destination,
          partner rules, and your risk profile. We and our partners may delay, hold, decline, or request additional
          information to meet KYC, KYB, AML, and sanctions obligations. See our{" "}
          <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          We or our partners may request <strong>source of funds, purpose of payment, or supporting documentation</strong>{" "}
          for high-value or higher-risk transactions before releasing funds.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">10. Availability</h2>
        <p className="text-[#5F665F] leading-relaxed">
          Services vary by jurisdiction and depend on partner capabilities, maintenance, and network conditions.
          Processing times are estimates, not guarantees. Preview or beta features may change or be withdrawn.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">11. Privacy</h2>
        <p className="text-[#5F665F] leading-relaxed">
          Our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> describes how we collect, use, and protect personal
          information. By using the Services, you consent to those practices and to processing required by partners for
          compliance.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">12. Prohibited Use</h2>
        <p className="text-[#5F665F] leading-relaxed">
          You may not use the Services to violate law, evade sanctions, launder money, finance terrorism, commit fraud,
          structure transactions to avoid monitoring, act as an unauthorized money transmitter, submit false information,
          abuse the platform, or engage in restricted merchant activity.
        </p>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          We may report suspicious activity as required by law and may not notify you when doing so.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">13. Disclaimers</h2>
        <p className="text-[#5F665F] leading-relaxed">
          THE SERVICES ARE PROVIDED <strong>&quot;AS IS&quot;</strong> AND <strong>&quot;AS AVAILABLE&quot;</strong> TO
          THE MAXIMUM EXTENT PERMITTED BY LAW.
        </p>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          Easner is not a bank, exchange, or asset custodian. Regulated financial products are provided by licensed
          partners. Easner does not provide investment, tax, or legal advice. Information in the Services is general in
          nature only.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">14. Limitation of Liability</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, EASNER AND ITS AFFILIATES SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS, DATA, USE, OR GOODWILL, ARISING FROM YOUR USE OF
          THE SERVICES.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          EASNER&apos;S TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE GREATER OF (A) FEES YOU PAID TO EASNER FOR THE
          RELEVANT SERVICE IN THE TWELVE (12) MONTHS BEFORE THE EVENT, OR (B) ONE HUNDRED U.S. DOLLARS (US $100), EXCEPT
          WHERE LIABILITY CANNOT BE LIMITED BY LAW.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          REGULATED SERVICES ARE PERFORMED BY THIRD-PARTY PARTNERS. EASNER IS NOT LIABLE FOR PARTNERS&apos; ACTS OR
          OMISSIONS EXCEPT AS REQUIRED BY LAW.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">15. Termination</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We may suspend or terminate access if you breach these Terms, pose a compliance or security risk, or if required
          by law or a partner. You may stop using the Services at any time. Surviving provisions include fees owed, dispute
          terms, and record retention obligations.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">16. Changes</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We may modify these Terms. Material changes will receive at least <strong>30 days&apos; notice</strong> before
          taking effect. Continued use after the effective date constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">17. Governing Law and Disputes</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Governing law:</strong> State of Delaware, USA, without regard to conflict-of-law rules, except where
          mandatory consumer protections in your country apply.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Informal resolution:</strong> Contact{" "}
          <a href="mailto:legal@easner.com" className="text-easner-primary hover:underline">
            legal@easner.com
          </a>{" "}
          and allow <strong>60 days</strong> to resolve disputes in good faith before arbitration or court action.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Arbitration:</strong> Disputes not resolved informally shall be settled by <strong>binding
          arbitration</strong> administered by the <strong>AAA</strong> under Consumer Arbitration Rules (individual users
          of Easner Mobile / Easner Personal Banking) or Commercial Arbitration Rules (Easner Business / Easner Business
          Banking and commercial use). Seat: <strong>Wilmington, Delaware</strong>, or remote by agreement. The{" "}
          <strong>Federal Arbitration Act</strong> applies.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Class and jury waiver:</strong> Disputes proceed <strong>only on an individual basis</strong> to the
          extent permitted by law. You and Easner waive jury trial for covered disputes.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Opt-out:</strong> Within <strong>30 days</strong> of first accepting these Terms, send written notice to{" "}
          <a href="mailto:legal@easner.com" className="text-easner-primary hover:underline">
            legal@easner.com
          </a>{" "}
          to opt out of arbitration.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Exceptions:</strong> Either party may use <strong>small claims court</strong> for qualifying claims or
          seek <strong>injunctive relief</strong> for unauthorized use or intellectual property abuse.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          <strong>Partner disputes:</strong>{" "}Claims arising solely from a licensed partner&apos;s regulated services may be
          subject to that partner&apos;s dispute process. Disputes with Easner relating to{" "}
          <strong>Easner for Partners</strong> are handled under these Terms and any signed commercial agreement.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">18. General Provisions</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Entire agreement:</strong> These Terms, together with the incorporated{" "}
          <PolicyLink href="/privacy">Privacy Policy</PolicyLink> and{" "}
          <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>, constitute the entire agreement between you
          and Easner regarding the Services.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Severability:</strong> If any provision is held invalid or unenforceable, the remaining provisions
          remain in effect.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written consent.
          Easner may assign these Terms in connection with a merger, acquisition, corporate reorganization, or sale of
          assets.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          <strong>Force majeure:</strong> Easner is not liable for delays or failures caused by events beyond our
          reasonable control, including partner outages, banking hours, network or blockchain failures, acts of government,
          or regulatory action.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] mb-4">19. Contact</h2>
        <PolicyContactBlock />
      </section>
    </PolicyPageShell>
  )
}
