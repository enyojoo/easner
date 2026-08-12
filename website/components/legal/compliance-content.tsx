import { PolicyContactBlock, PolicyLink, PolicyPageShell, PolicyTable } from "@/components/legal/policy-page-shell"


export function CompliancePolicyPage() {
  return (
    <PolicyPageShell title="KYC/KYB and AML Policy" lastUpdated="August 12, 2026">
      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">1. Overview</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Easner Group, Inc.</strong> (“<strong>Easner</strong>,” “<strong>we</strong>,” “<strong>us</strong>,” or “<strong>our</strong>”) maintains a compliance program covering know-your-customer (<strong>KYC</strong>), know-your-business (<strong>KYB</strong>), and anti-money laundering (<strong>AML</strong>) obligations across <strong>Easner Personal Banking</strong> and <strong>Easner Business Banking</strong>.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Easner is a financial technology company. Banking, money transmission, payment acceptance, verification, and related regulated services accessible through our platform are provided by <strong>licensed partners</strong>. Easner designs and operates the technology experience; partners perform regulated financial and compliance services under their licenses and regulatory frameworks.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          For Turnkey-backed wallet features, Easner is <strong>not a custodian</strong> and does <strong>not</strong> sit in the flow of funds as a signing party (keys and signing are managed in Turnkey’s infrastructure; Easner controls product access only). Fiat money-transmission rails (including <strong>Lightspark Grid</strong>, <strong>Noah</strong>, and <strong>Yellowcard</strong> where enabled) remain partner-provided under those partners’ licenses and terms. See our Terms of Service for the full self-custody disclosure.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          This policy explains who may use our Services, how we verify customers and businesses, how we monitor for financial crime, and your responsibilities. For how we handle personal data, see our Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">2. Know Your Customer and Know Your Business</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>KYC</strong> is the process of verifying the identity of individual users.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>KYB</strong> is the process of verifying business entities, their legal status, beneficial owners, and authorized representatives.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>AML</strong> comprises the laws, regulations, and controls designed to prevent money laundering, terrorist financing, fraud, and other financial crime – including customer due diligence, sanctions screening, transaction monitoring, recordkeeping, and reporting to authorities.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Together, these programs help protect Easner, our partners, our users, and the integrity of the financial system.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">3. Supported Jurisdictions</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Access to Tier 1 global banking – including identity verification, virtual accounts, and fiat pay-in and pay-out – depends on <strong>licensed partner</strong> eligibility rules and Easner product availability. <strong>Easner Business Banking</strong> and <strong>Easner Personal Banking</strong> apply product-specific residence rules for signup and verification. Countries offered at registration may also reflect our current rollout and Office allowlists.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Eligibility principles</h3>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>You must be <strong>18 or older</strong> and truthfully represent your country of residence or business registration.</li>
          <li>All users and transactions are screened against applicable <strong>sanctions and watchlists</strong> (including OFAC, UN, EU, and UK). A match may block onboarding or payments regardless of country.</li>
          <li>Partners may require <strong>Enhanced Due Diligence</strong> for higher-risk profiles or jurisdictions.</li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Easner Business Banking – hard-blocked jurisdictions</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We do not onboard businesses located in, ordinarily resident in, or organized under the laws of:
        </p>
        <PolicyTable
          headers={["Jurisdiction", "ISO"]}
          rows={[
            ["Afghanistan", "AF"],
            ["Belarus", "BY"],
            ["Bhutan", "BT"],
            ["Burundi", "BI"],
            ["Congo (Democratic Republic of the)", "CD"],
            ["Cuba", "CU"],
            ["Gaza Strip / West Bank (Palestinian Territories)", "PS"],
            ["Guinea-Bissau", "GW"],
            ["Haiti", "HT"],
            ["Iran", "IR"],
            ["Iraq", "IQ"],
            ["Kenya", "KE"],
            ["Kosovo", "XK"],
            ["Lebanon", "LB"],
            ["Libya", "LY"],
            ["Mozambique", "MZ"],
            ["Myanmar", "MM"],
            ["North Korea (Democratic People's Republic of Korea)", "KP"],
            ["Pakistan", "PK"],
            ["Qatar", "QA"],
            ["Russia", "RU"],
            ["Somalia", "SO"],
            ["South Sudan", "SS"],
            ["Sudan", "SD"],
            ["Syria", "SY"],
            ["Venezuela", "VE"],
            ["Yemen", "YE"],
            ["Zimbabwe", "ZW"]
          ]}
        />
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We also do not provide Services in <strong>Crimea, Sevastopol, Donetsk, Kherson, Luhansk, or Zaporizhzhia</strong> (sub-national regions; not selectable as standalone countries in registration).
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          These jurisdictions are excluded from Easner Business Banking signup and KYB country pickers.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Easner Personal Banking – hard-blocked jurisdictions</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We do not onboard Personal Banking users located in, or ordinarily resident in:
        </p>
        <PolicyTable
          headers={["Jurisdiction", "ISO"]}
          rows={[
            ["Afghanistan", "AF"],
            ["Burkina Faso", "BF"],
            ["Belarus", "BY"],
            ["Congo (Democratic Republic of the)", "CD"],
            ["Central African Republic", "CF"],
            ["Cuba", "CU"],
            ["United Kingdom", "GB"],
            ["Guinea-Bissau", "GW"],
            ["Haiti", "HT"],
            ["Iraq", "IQ"],
            ["Iran", "IR"],
            ["North Korea (Democratic People's Republic of Korea)", "KP"],
            ["Lebanon", "LB"],
            ["Libya", "LY"],
            ["Mali", "ML"],
            ["Myanmar", "MM"],
            ["Mozambique", "MZ"],
            ["Nicaragua", "NI"],
            ["Panama", "PA"],
            ["Pakistan", "PK"],
            ["Palestinian Territory", "PS"],
            ["Russia", "RU"],
            ["Sudan", "SD"],
            ["Somalia", "SO"],
            ["South Sudan", "SS"],
            ["Syria", "SY"],
            ["Ukraine", "UA"],
            ["Venezuela", "VE"],
            ["Vanuatu", "VU"],
            ["Yemen", "YE"],
            ["Zimbabwe", "ZW"]
          ]}
        />
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Product notes: <strong>Kenya (KE)</strong> is blocked on Easner Business Banking but may be available on Easner Personal Banking. <strong>United Kingdom (GB)</strong> remains available on Easner Business Banking and is blocked on Easner Personal Banking. <strong>Ukraine (UA)</strong> is blocked on Easner Personal Banking as a whole; occupied territories listed above remain excluded on Easner Business Banking as sub-national regions.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Other jurisdictions</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          If your country is not listed above for the product you are using, you may be eligible subject to partner approval, successful verification, sanctions screening, and Easner feature availability. Cross-border and local corridors (for example mobile money or local bank rails in Africa, Latin America, Asia, and other regions) may be available to eligible Tier 1 global users without constituting a separate regional banking account product.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Partner jurisdiction policies may change. We update our practices when material changes apply.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Source of truth in product code: `packages/shared/src/jurisdiction-blocked-countries.ts`.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">4. When We Verify</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We conduct KYC/KYB when:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>You register for an account or before regulated features are enabled</li>
          <li>You send, receive, or fund an account through partner rails</li>
          <li>Virtual accounts, stablecoin deposit addresses, payroll disbursement, online payments (Stripe Connect), or card products are provisioned or enabled</li>
          <li>Periodic or risk-based reviews are required</li>
          <li>Your profile, ownership, activity, or jurisdiction changes materially</li>
          <li>A partner or regulator requires additional information</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed">
          You may need to accept <strong>partner terms</strong> presented during hosted verification before certain services are enabled. For <strong>Lightspark Grid</strong> money transmission, the Lightspark End User Terms included in our Terms of Service also apply. For <strong>Noah</strong> money transmission and related payment services, Noah’s partner terms and notices presented during onboarding also apply (<strong>Noah US, Inc.</strong>, NMLS ID 2696057 for applicable U.S. money-transmission services). For <strong>Yellowcard</strong> corridor payments, Yellowcard’s partner terms presented during onboarding or in the payment flow also apply.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">5. Information We Collect</h2>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Annex A – Individual users (Easner Personal Banking)</h3>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Full legal name, date of birth, nationality, and residential address</li>
          <li>Government-issued photo ID and proof of address where required</li>
          <li>Phone, email, and tax or national identifiers where applicable</li>
          <li>Employment, occupation, source of funds, and expected activity where required</li>
          <li>Selfie or liveness data where required for fraud prevention</li>
          <li>Verification status and related compliance metadata</li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Annex B – Business users (Easner Business Banking)</h3>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Legal name, registration number, jurisdiction, and business address</li>
          <li>Business website and customer-facing contact details where required for KYB</li>
          <li>Industry, nature of business, tax IDs, and registration documents</li>
          <li>Beneficial owners and persons with significant control (typically 25% or more, or as required by law)</li>
          <li>Authorized signatories and their identity verification</li>
          <li>Source of funds, expected volumes, and operational details</li>
          <li>Team members with access to the business account, where required for access control</li>
          <li>Merchant / online-payments details required by Stripe when Connect is enabled</li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Document standards</h3>
        <p className="text-[#5F665F] leading-relaxed">
          Identity documents must be valid, legible, and match account information. Address documents are typically dated within the last three months unless otherwise specified. Non-English documents may require certified translation. We or our partners may request additional documents based on risk, product, or jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">6. Verification Process</h2>
        <ol className="list-decimal pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>You create an Easner account.</li>
          <li>You complete <strong>hosted verification</strong> with a licensed partner:</li>
        </ol>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li><strong>Easner Personal Banking (individuals):</strong> <strong>Noah</strong> KYC (in-app or browser).</li>
          <li><strong>Easner Business Banking:</strong> <strong>Lightspark Grid</strong> KYB.</li>
        </ul>
        <ol className="list-decimal pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Automated and, where needed, manual review is performed.</li>
          <li>Sanctions, PEP, and adverse media screening is conducted.</li>
          <li>You receive an outcome: approved, pending, rejected, or a request for more information.</li>
          <li>Upon approval, eligible accounts, payment rails, and features are provisioned by tier and partner enablement.</li>
        </ol>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Most verifications complete within <strong>1–3 business days</strong>. Complex cases may take longer.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          For Grid money-transmission customers, Easner records acceptance of Lightspark’s End User Terms (version, timestamp, IP, and acceptance method) and provides that consent to Lightspark as required before accounts can open.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">7. Our AML Program</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Easner’s AML framework includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li><strong>Customer Due Diligence (CDD)</strong> – KYC/KYB before regulated services are used</li>
          <li><strong>Enhanced Due Diligence (EDD)</strong> – for PEPs, high-risk geographies, unusual activity, or complex structures</li>
          <li><strong>Sanctions screening</strong> – of customers, beneficiaries, and transactions</li>
          <li><strong>Transaction monitoring</strong> – across fiat, stablecoin, wallet, payroll, and card-acceptance activity where enabled</li>
          <li><strong>Suspicious activity reporting</strong> – to relevant authorities when required</li>
          <li><strong>Recordkeeping</strong> – typically <strong>5 to 7 years</strong> after account closure or last activity, or longer where mandated</li>
          <li><strong>Training and governance</strong> – for personnel with compliance responsibilities, in coordination with licensed partners</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Licensed partners perform identity verification, screening, and much of the transaction monitoring underlying our Services. Easner integrates partner outputs into account decisions, limits, and escalation.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Transaction monitoring</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We and our partners review activity for indicators such as unusual size or frequency, structuring, inconsistent use versus profile, high-risk corridors, sanctions exposure, and – for business users – patterns inconsistent with invoicing, Terminal, QR Pay, payroll, or online card-acceptance activity.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We may pause, decline, or request information about transactions pending compliance review.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Suspicious activity reporting</h3>
        <p className="text-[#5F665F] leading-relaxed">
          Where we or a partner identify potentially suspicious activity, a <strong>Suspicious Activity Report</strong> or equivalent filing may be made to the appropriate authority. <strong>We cannot inform you</strong> when such a report is filed or an investigation is underway – this is required by law to prevent “tipping off.”
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">8. Tier Entitlements</h2>
        <PolicyTable
          headers={["Tier", "Description", "Typical requirement"]}
          rows={[
            ["**Tier 1 – Global banking**", "USD/EUR accounts, pay-in/pay-out, regional corridors where enabled, stablecoin flows", "Approved KYC or KYB"],
            ["**Tier 2 – Cards**", "Personal or business cards when available", "Separate partner approval; **not generally live today**"],
            ["**Tier 3 – Online payments (Business Banking)**", "Accept card payments on invoices via Stripe Connect; settlement to Easner balance", "Approved KYB plus Stripe Connected Account onboarding"]
          ]}
        />
        <p className="text-[#5F665F] leading-relaxed">
          Cross-border and local pay-in/pay-out corridors (for example via Yellowcard mobile-money or local bank rails in Africa, Latin America, Asia, and other regions) may be offered to eligible Tier 1 global users and jurisdictions. They are a corridor capability under Tier 1, not a separate regional banking account tier, unless we expressly launch one.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">9. Verification Outcomes and Limits</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Approved:</strong> You may use Services within your tier, limits, and partner availability.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Pending:</strong> Some features may be restricted until review completes.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Rejected:</strong> Common reasons include invalid documents, information mismatches, incomplete files, sanctions concerns, or jurisdiction ineligibility. You may be able to resubmit where permitted.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We and our partners may impose transaction limits, corridor restrictions, or holds based on verification level and risk. Limits are communicated in the app or dashboard where practicable.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Online payments may be limited or suspended independently based on Stripe, card-network, or Easner risk decisions.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">10. Your Responsibilities</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You must:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Provide accurate, complete, and current information</li>
          <li>Use the Services only for lawful purposes</li>
          <li>Cooperate with verification and information requests</li>
          <li>Notify us of changes to identity, ownership, or business activity</li>
          <li>Not evade sanctions, monitoring, or geographic restrictions</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed">
          False or misleading information may result in account closure and reporting to authorities.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">11. Your Rights</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You may access verification status in the app or dashboard, request correction of inaccurate information (subject to regulatory limits), and contact us about the verification process. Some rights are limited by AML and recordkeeping laws.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          For data held by a licensed partner, contact <strong>legal@easner.com</strong> and we will coordinate where appropriate.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">12. Sharing and Security</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We share KYC/KYB and compliance information with <strong>licensed partners</strong>, infrastructure providers, regulators, law enforcement, and other institutions where permitted by law and necessary to provide or protect the Services. See our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> (Section 5) for named financial and infrastructure partners (including Lightspark Grid, Noah, and Yellowcard as fiat money-transmission / payments partners, Sumsub, Stripe, Turnkey, and Relay where applicable).
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          We protect compliance data with encryption, access controls, and confidentiality training. Partners retain data under their own regulatory obligations, which may continue after your Easner account closes.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">13. Changes to This Policy</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We may update this policy as regulations, partners, or our Services evolve. Material changes will be posted with an updated “Last updated” date.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">14. Contact Us</h2>
        <PolicyContactBlock />
      </section>

    </PolicyPageShell>
  )
}
