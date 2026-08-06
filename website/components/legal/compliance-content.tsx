import { PolicyContactBlock, PolicyLink, PolicyPageShell, PolicyTable } from "@/components/legal/policy-page-shell"

const prohibitedJurisdictions = [
  "Cuba",
  "Iran",
  "Myanmar",
  "North Korea (Democratic People's Republic of Korea)",
  "Syria",
]

const controlledJurisdictions = [
  "Afghanistan",
  "Algeria",
  "Bangladesh",
  "Belarus",
  "China",
  "Congo (Democratic Republic of the)",
  "Gaza Strip / West Bank (Palestinian Territories)",
  "Haiti",
  "Iraq",
  "Lebanon",
  "Libya",
  "Morocco",
  "Mozambique",
  "Nepal",
  "Nicaragua",
  "North Macedonia",
  "Qatar",
  "Pakistan",
  "Russia",
  "Somalia",
  "South Sudan",
  "Sudan",
  "Venezuela",
  "Yemen",
]

export function CompliancePolicyPage() {
  return (
    <PolicyPageShell title="KYC/KYB and AML Policy" lastUpdated="June 8, 2026">
      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">1. Overview</h2>
        <p className="text-[#5F665F] leading-relaxed">
          <strong>Easner Group, Inc.</strong> (&quot;<strong>Easner</strong>,&quot; &quot;<strong>we</strong>,&quot;
          &quot;<strong>us</strong>,&quot; or &quot;<strong>our</strong>&quot;) maintains a compliance program covering
          know-your-customer (<strong>KYC</strong>), know-your-business (<strong>KYB</strong>), and anti-money
          laundering (<strong>AML</strong>) obligations across <strong>Easner Mobile</strong> (
          <strong>Easner Personal Banking</strong>), <strong>Easner Business</strong> (
          <strong>Easner Business Banking</strong>), and <strong>Easner for Partners</strong> (Agency Model and
          Developer Model).
        </p>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          Easner is a financial technology company. Banking, payment, verification, and related regulated services
          accessible through our platform are provided by <strong>licensed partners</strong>. Easner designs and
          operates the technology experience; partners perform regulated financial and compliance services under their
          licenses and regulatory frameworks.
        </p>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          This policy explains who may use our Services, how we verify customers and businesses, how we monitor for
          financial crime, and your responsibilities. For how we handle personal data, see our{" "}
          <PolicyLink href="/privacy">Privacy Policy</PolicyLink>.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">2. Know Your Customer and Know Your Business</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>KYC</strong> is the process of verifying the identity of individual users.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>KYB</strong> is the process of verifying business entities, their legal status, beneficial owners, and
          authorized representatives.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>AML</strong> comprises the laws, regulations, and controls designed to prevent money laundering,
          terrorist financing, fraud, and other financial crime – including customer due diligence, sanctions
          screening, transaction monitoring, recordkeeping, and reporting to authorities.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          Together, these programs help protect Easner, our partners, our users, and the integrity of the financial
          system.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">3. Supported Jurisdictions</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Access to global banking – including identity verification, virtual accounts, and fiat pay-in and pay-out –
          depends on <strong>licensed partner</strong> eligibility rules and Easner product availability.
          Countries offered at registration may reflect our current rollout.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Eligibility principles</h3>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            You must be <strong>18 or older</strong> and truthfully represent your country of residence or business
            registration.
          </li>
          <li>
            All users and transactions are screened against applicable <strong>sanctions and watchlists</strong>{" "}
            (including OFAC, UN, EU, and UK). A match may block onboarding or payments regardless of country.
          </li>
          <li>
            Partners may require <strong>Enhanced Due Diligence</strong> for higher-risk profiles or jurisdictions.
          </li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Prohibited jurisdictions</h3>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          We do not onboard or provide Services to persons or businesses located in, ordinarily resident in, or
          organized under the laws of:
        </p>
        <PolicyTable
          headers={["Jurisdiction"]}
          rows={prohibitedJurisdictions.map((j) => [j])}
        />
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We also do not provide Services in <strong>Crimea, Sevastopol, Donetsk, Kherson, Luhansk, or Zaporizhzhia</strong>.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Controlled jurisdictions</h3>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          We do not onboard users or businesses in the following jurisdictions except under specially approved partner
          programs (not generally available through Easner):
        </p>
        <PolicyTable
          headers={["Jurisdiction"]}
          rows={controlledJurisdictions.map((j) => [j])}
        />
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Other jurisdictions</h3>
        <p className="text-[#5F665F] leading-relaxed">
          If your country is not listed above, you may be eligible subject to partner approval, successful
          verification, sanctions screening, and Easner feature availability. <strong>Local & regional banking</strong> and other
          products may impose additional limits when launched.
        </p>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          Partner jurisdiction policies may change. We update our practices when material changes apply.
        </p>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          <strong>Easner for Partners</strong> is available by invitation and commercial approval only. It is not
          subject to the same self-serve jurisdiction list as Easner Mobile or Easner Business.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">4. When We Verify</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">We conduct KYC/KYB when:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F]">
          <li>You register for an account or before regulated features are enabled</li>
          <li>You send, receive, or fund an account through partner rails</li>
          <li>Virtual accounts, stablecoin deposit addresses, or card products are provisioned</li>
          <li>Periodic or risk-based reviews are required</li>
          <li>Your profile, ownership, activity, or jurisdiction changes materially</li>
          <li>A partner or regulator requires additional information</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          You may need to accept <strong>partner terms</strong> presented during hosted verification before certain
          services are enabled.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">5. Information We Collect</h2>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">
          Annex A – Individual users (Easner Mobile / Easner Personal Banking)
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Full legal name, date of birth, nationality, and residential address</li>
          <li>Government-issued photo ID and proof of address where required</li>
          <li>Phone, email, and tax or national identifiers where applicable</li>
          <li>Employment, occupation, source of funds, and expected activity where required</li>
          <li>Selfie or liveness data where required for fraud prevention</li>
          <li>Verification status and related compliance metadata</li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">
          Annex B – Business users (Easner Business / Easner Business Banking)
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Legal name, registration number, jurisdiction, and business address</li>
          <li>Business website and customer-facing contact details where required for KYB</li>
          <li>Industry, nature of business, tax IDs, and registration documents</li>
          <li>
            Beneficial owners and persons with significant control (typically 25% or more, or as required by law)
          </li>
          <li>Authorized signatories and their identity verification</li>
          <li>Source of funds, expected volumes, and operational details</li>
          <li>Team members with access to the business account, where required for access control</li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">
          Annex C – Easner for Partners program participants
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            Program operator legal entity, licensing or registration (where relevant for OTC/MTA or MSB-adjacent
            activity), and jurisdictions of operation
          </li>
          <li>Beneficial owners, directors, and compliance officers</li>
          <li>
            Branded program scope (corridors, customer types, faith or nonprofit network structure where applicable)
          </li>
          <li>Agent, branch, or sub-participant structures for Agency deployments</li>
          <li>API integration and operational details for Developer deployments</li>
          <li>
            Enhanced due diligence artifacts for higher-risk program types (volume, corridors, nested onboarding)
          </li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Document standards</h3>
        <p className="text-[#5F665F] leading-relaxed">
          Identity documents must be valid, legible, and match account information. Address documents are typically
          dated within the last three months unless otherwise specified. Non-English documents may require certified
          translation. We or our partners may request additional documents based on risk, product, or jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">6. Verification Process</h2>
        <ol className="list-decimal pl-6 space-y-2 text-[#5F665F]">
          <li>You create an Easner account.</li>
          <li>
            You complete <strong>hosted verification</strong> with a licensed partner such as <strong>Noah</strong>{" "}
            (in-app or browser).
          </li>
          <li>Automated and, where needed, manual review is performed.</li>
          <li>Sanctions, PEP, and adverse media screening is conducted.</li>
          <li>You receive an outcome: approved, pending, rejected, or a request for more information.</li>
          <li>Upon approval, eligible accounts, payment rails, and features are provisioned based on your verification outcome and product eligibility.</li>
        </ol>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          Most verifications complete within <strong>1–3 business days</strong>. Complex cases may take longer.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">7. Our AML Program</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">Easner&apos;s AML framework includes:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            <strong>Customer Due Diligence (CDD)</strong> – KYC/KYB before regulated services are used
          </li>
          <li>
            <strong>Enhanced Due Diligence (EDD)</strong> – for PEPs, high-risk geographies, unusual activity, or
            complex structures
          </li>
          <li>
            <strong>Sanctions screening</strong> – of customers, beneficiaries, and transactions
          </li>
          <li>
            <strong>Transaction monitoring</strong> – across fiat, stablecoin, and wallet activity where enabled
          </li>
          <li>
            <strong>Suspicious activity reporting</strong> – to relevant authorities when required
          </li>
          <li>
            <strong>Recordkeeping</strong> – typically <strong>5 to 7 years</strong> after account closure or last
            activity, or longer where mandated
          </li>
          <li>
            <strong>Training and governance</strong> – for personnel with compliance responsibilities, in coordination
            with licensed partners
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Licensed partners perform identity verification, screening, and much of the transaction monitoring underlying
          our Services. Easner integrates partner outputs into account decisions, limits, and escalation.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Transaction monitoring</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We and our partners review activity for indicators such as unusual size or frequency, structuring,
          inconsistent use versus profile, high-risk corridors, sanctions exposure, and – for business users – patterns
          inconsistent with invoicing, Terminal, or QR Pay activity – and, for <strong>Easner for Partners</strong>{" "}
          program activity, volumes inconsistent with an approved program profile, unauthorized corridors, or end-user
          patterns suggesting the partner is not performing required verification.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We may pause, decline, or request information about transactions pending compliance review.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Suspicious activity reporting</h3>
        <p className="text-[#5F665F] leading-relaxed">
          Where we or a partner identify potentially suspicious activity, a <strong>Suspicious Activity Report</strong>{" "}
          or equivalent filing may be made to the appropriate authority. <strong>We cannot inform you</strong>{" "}when such
          a report is filed or an investigation is underway – this is required by law to prevent &quot;tipping
          off.&quot;
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">8. Product Entitlements</h2>
        <PolicyTable
          headers={["Product", "Description", "Typical requirement"]}
          rows={[
            [
              "Global banking",
              "USD/EUR accounts, pay-in/pay-out, stablecoin flows (and other currencies where enabled)",
              "Approved KYC or KYB",
            ],
            [
              "Local & regional banking",
              "NGN and regional rails where launched",
              "Approved KYC or KYB plus additional eligibility",
            ],
            [
              "Cards",
              "Personal or corporate cards when available",
              "Separate partner approval",
            ],
          ]}
        />
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">9. Verification Outcomes and Limits</h2>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Approved:</strong> You may use Services within your approved products, limits, and partner availability.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-2">
          <strong>Pending:</strong> Some features may be restricted until review completes.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Rejected:</strong> Common reasons include invalid documents, information mismatches, incomplete files,
          sanctions concerns, or jurisdiction ineligibility. You may be able to resubmit where permitted.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          We and our partners may impose transaction limits, corridor restrictions, or holds based on verification level
          and risk. Limits are communicated in the app or dashboard where practicable.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">10. Your Responsibilities</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">You must:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F]">
          <li>Provide accurate, complete, and current information</li>
          <li>Use the Services only for lawful purposes</li>
          <li>Cooperate with verification and information requests</li>
          <li>Notify us of changes to identity, ownership, or business activity</li>
          <li>Not evade sanctions, monitoring, or geographic restrictions</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          False or misleading information may result in account closure and reporting to authorities.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">11. Your Rights</h2>
        <p className="text-[#5F665F] leading-relaxed">
          You may access verification status in the app or dashboard, request correction of inaccurate information
          (subject to regulatory limits), and contact us about the verification process. Some rights are limited by AML
          and recordkeeping laws.
        </p>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          For data held by a licensed partner, contact{" "}
          <a href="mailto:legal@easner.com" className="text-easner-primary hover:underline">
            legal@easner.com
          </a>{" "}
          and we will coordinate where appropriate.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">12. Sharing and Security</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We share KYC/KYB and compliance information with <strong>licensed partners</strong>, infrastructure providers,
          regulators, law enforcement, and other institutions where permitted by law and necessary to provide or
          protect the Services. See our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> (Section 5.1) for named
          financial and infrastructure partners.
        </p>
        <p className="text-[#5F665F] leading-relaxed mt-4">
          We protect compliance data with encryption, access controls, and confidentiality training. Partners retain data
          under their own regulatory obligations, which may continue after your Easner account closes.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">13. Changes to This Policy</h2>
        <p className="text-[#5F665F] leading-relaxed">
          We may update this policy as regulations, partners, or our Services evolve. Material changes will be posted
          with an updated &quot;Last updated&quot; date.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">14. Contact Us</h2>
        <PolicyContactBlock department="Compliance Department" />
      </section>
    </PolicyPageShell>
  )
}
