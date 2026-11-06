import { PolicyContactBlock, PolicyPageShell, PolicyLink } from "@/components/legal/policy-page-shell"


export function CompliancePolicyPage() {
  return (
    <PolicyPageShell title="KYC/KYB and AML Policy" lastUpdated="November 6, 2026">
      <section>

      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">1. Overview</h2>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>Easner Group, Inc.</strong> (“<strong>Easner</strong>,” “<strong>we</strong>,” “<strong>us</strong>,” or “<strong>our</strong>”) maintains a compliance program covering know-your-customer (<strong>KYC</strong>), know-your-business (<strong>KYB</strong>), and anti-money laundering (<strong>AML</strong>) obligations across <strong>Easner Personal Banking</strong> and <strong>Easner Business Banking</strong>.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          Easner is a financial technology company. Banking, money transmission, payment acceptance, verification, and related regulated services accessible through our platform are provided by <strong>licensed partners</strong>. Easner designs and operates the technology experience; partners perform regulated financial and compliance services under their licenses and regulatory frameworks.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          For Turnkey-backed wallet features, Easner is <strong>not a custodian</strong> and does <strong>not</strong> sit in the flow of funds as a signing party (keys and signing are managed in <strong>Turnkey</strong> infrastructure; Easner controls product access only). Fiat money-transmission rails remain <strong>partner-provided</strong> under those partners’ licenses and terms. See our <PolicyLink href="/terms">Terms of Service</PolicyLink> and <PolicyLink href="/legal/disclosures/digital-assets">Digital assets disclosure</PolicyLink>.
        </p>
        <p className="text-web-body leading-relaxed">
          This policy explains who may use our Services, how we verify customers and businesses, how we monitor for financial crime, and your responsibilities. For how we handle personal data, see our <PolicyLink href="/privacy">Privacy Policy</PolicyLink>. Named partners are listed on <strong><PolicyLink href="/legal/partners">Partners and service providers</PolicyLink></strong>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">2. Know Your Customer and Know Your Business</h2>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>KYC</strong> is the process of verifying the identity of individual users.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>KYB</strong> is the process of verifying business entities, their legal status, beneficial owners, and authorized representatives.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>AML</strong> comprises the laws, regulations, and controls designed to prevent money laundering, terrorist financing, fraud, and other financial crime – including customer due diligence, sanctions screening, transaction monitoring, recordkeeping, and reporting to authorities.
        </p>
        <p className="text-web-body leading-relaxed">
          Together, these programs help protect Easner, our partners, our users, and the integrity of the financial system.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">3. Supported Jurisdictions</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Access to <strong>global banking</strong> – including identity verification, virtual accounts, and fiat pay-in and pay-out – depends on <strong>licensed partner</strong> eligibility rules and Easner product availability. <strong>Easner Business Banking</strong> and <strong>Easner Personal Banking</strong> apply product-specific residence rules for signup and verification. Countries offered at registration may also reflect our current rollout and Office allowlists.
        </p>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Eligibility principles</h3>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>You must be <strong>18 or older</strong> and truthfully represent your country of residence or business registration.</li>
          <li>All users and transactions are screened against applicable <strong>sanctions and watchlists</strong> (including OFAC, UN, EU, and UK). A match may block onboarding or payments regardless of country.</li>
          <li>Partners may require <strong>Enhanced Due Diligence</strong> for higher-risk profiles or jurisdictions.</li>
        </ul>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Easner Business Banking – hard-blocked jurisdictions</h3>
        <p className="text-web-body leading-relaxed mb-4">
          We do not onboard businesses located in, ordinarily resident in, or organized under the laws of:
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Jurisdiction
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                ISO
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Afghanistan
                </td>
                <td className="px-4 py-3 align-top">
                  AF
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Belarus
                </td>
                <td className="px-4 py-3 align-top">
                  BY
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Bhutan
                </td>
                <td className="px-4 py-3 align-top">
                  BT
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Burundi
                </td>
                <td className="px-4 py-3 align-top">
                  BI
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Congo (Democratic Republic of the)
                </td>
                <td className="px-4 py-3 align-top">
                  CD
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Cuba
                </td>
                <td className="px-4 py-3 align-top">
                  CU
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Gaza Strip / West Bank (Palestinian Territories)
                </td>
                <td className="px-4 py-3 align-top">
                  PS
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Guinea-Bissau
                </td>
                <td className="px-4 py-3 align-top">
                  GW
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Haiti
                </td>
                <td className="px-4 py-3 align-top">
                  HT
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Iran
                </td>
                <td className="px-4 py-3 align-top">
                  IR
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Iraq
                </td>
                <td className="px-4 py-3 align-top">
                  IQ
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Kenya
                </td>
                <td className="px-4 py-3 align-top">
                  KE
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Kosovo
                </td>
                <td className="px-4 py-3 align-top">
                  XK
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Lebanon
                </td>
                <td className="px-4 py-3 align-top">
                  LB
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Libya
                </td>
                <td className="px-4 py-3 align-top">
                  LY
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Mozambique
                </td>
                <td className="px-4 py-3 align-top">
                  MZ
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Myanmar
                </td>
                <td className="px-4 py-3 align-top">
                  MM
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  North Korea (Democratic People's Republic of Korea)
                </td>
                <td className="px-4 py-3 align-top">
                  KP
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Pakistan
                </td>
                <td className="px-4 py-3 align-top">
                  PK
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Qatar
                </td>
                <td className="px-4 py-3 align-top">
                  QA
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Russia
                </td>
                <td className="px-4 py-3 align-top">
                  RU
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Somalia
                </td>
                <td className="px-4 py-3 align-top">
                  SO
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  South Sudan
                </td>
                <td className="px-4 py-3 align-top">
                  SS
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Sudan
                </td>
                <td className="px-4 py-3 align-top">
                  SD
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Syria
                </td>
                <td className="px-4 py-3 align-top">
                  SY
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Venezuela
                </td>
                <td className="px-4 py-3 align-top">
                  VE
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Yemen
                </td>
                <td className="px-4 py-3 align-top">
                  YE
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Zimbabwe
                </td>
                <td className="px-4 py-3 align-top">
                  ZW
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed mb-4">
          We also do not provide Services in <strong>Crimea, Sevastopol, Donetsk, Kherson, Luhansk, or Zaporizhzhia</strong> (sub-national regions; not selectable as standalone countries in registration).
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          These jurisdictions are excluded from Easner Business Banking signup and KYB country pickers.
        </p>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Easner Personal Banking – hard-blocked jurisdictions</h3>
        <p className="text-web-body leading-relaxed mb-4">
          We do not onboard Personal Banking users located in, or ordinarily resident in:
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Jurisdiction
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                ISO
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Afghanistan
                </td>
                <td className="px-4 py-3 align-top">
                  AF
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Burkina Faso
                </td>
                <td className="px-4 py-3 align-top">
                  BF
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Belarus
                </td>
                <td className="px-4 py-3 align-top">
                  BY
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Congo (Democratic Republic of the)
                </td>
                <td className="px-4 py-3 align-top">
                  CD
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Central African Republic
                </td>
                <td className="px-4 py-3 align-top">
                  CF
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Cuba
                </td>
                <td className="px-4 py-3 align-top">
                  CU
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  United Kingdom
                </td>
                <td className="px-4 py-3 align-top">
                  GB
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Guinea-Bissau
                </td>
                <td className="px-4 py-3 align-top">
                  GW
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Haiti
                </td>
                <td className="px-4 py-3 align-top">
                  HT
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Iraq
                </td>
                <td className="px-4 py-3 align-top">
                  IQ
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Iran
                </td>
                <td className="px-4 py-3 align-top">
                  IR
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  North Korea (Democratic People's Republic of Korea)
                </td>
                <td className="px-4 py-3 align-top">
                  KP
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Lebanon
                </td>
                <td className="px-4 py-3 align-top">
                  LB
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Libya
                </td>
                <td className="px-4 py-3 align-top">
                  LY
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Mali
                </td>
                <td className="px-4 py-3 align-top">
                  ML
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Myanmar
                </td>
                <td className="px-4 py-3 align-top">
                  MM
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Mozambique
                </td>
                <td className="px-4 py-3 align-top">
                  MZ
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Nicaragua
                </td>
                <td className="px-4 py-3 align-top">
                  NI
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Panama
                </td>
                <td className="px-4 py-3 align-top">
                  PA
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Pakistan
                </td>
                <td className="px-4 py-3 align-top">
                  PK
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Palestinian Territory
                </td>
                <td className="px-4 py-3 align-top">
                  PS
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Russia
                </td>
                <td className="px-4 py-3 align-top">
                  RU
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Sudan
                </td>
                <td className="px-4 py-3 align-top">
                  SD
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Somalia
                </td>
                <td className="px-4 py-3 align-top">
                  SO
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  South Sudan
                </td>
                <td className="px-4 py-3 align-top">
                  SS
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Syria
                </td>
                <td className="px-4 py-3 align-top">
                  SY
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Ukraine
                </td>
                <td className="px-4 py-3 align-top">
                  UA
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Venezuela
                </td>
                <td className="px-4 py-3 align-top">
                  VE
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Vanuatu
                </td>
                <td className="px-4 py-3 align-top">
                  VU
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Yemen
                </td>
                <td className="px-4 py-3 align-top">
                  YE
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  Zimbabwe
                </td>
                <td className="px-4 py-3 align-top">
                  ZW
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Other jurisdictions</h3>
        <p className="text-web-body leading-relaxed mb-4">
          If your country is not listed above for the product you are using, you may be eligible subject to partner approval, successful verification, sanctions screening, and Easner feature availability. Cross-border and local corridors (for example mobile money or local bank rails in Africa, Latin America, Asia, and other regions) may be available to eligible users with approved verification without constituting a separate regional banking account product.
        </p>
        <p className="text-web-body leading-relaxed">
          Partner jurisdiction policies may change. We update our practices when material changes apply.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">4. When We Verify</h2>
        <p className="text-web-body leading-relaxed mb-4">
          We conduct KYC/KYB when:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>You register for an account or before regulated features are enabled</li>
          <li>You send, receive, or fund an account through partner rails</li>
          <li>Virtual accounts, stablecoin deposit addresses, payroll disbursement, <strong>online payments</strong>, or card products are provisioned or enabled</li>
          <li>You need <strong>additional verification</strong> for a product or corridor (for example online payments merchant setup, or destination-specific requirements)</li>
          <li>Periodic or risk-based reviews are required</li>
          <li>Your profile, ownership, activity, or jurisdiction changes materially</li>
          <li>A partner or regulator requires additional information</li>
        </ul>
        <p className="text-web-body leading-relaxed">
          You may need to accept <strong>partner terms</strong> presented during hosted verification or before certain services are enabled. Where <strong>Lightspark Grid</strong> money transmission applies, the <PolicyLink href="/legal/lightspark-eut">Lightspark Grid End User Terms</PolicyLink> incorporated into our <PolicyLink href="/terms">Terms of Service</PolicyLink> also apply. Easner records acceptance of applicable partner terms where required before accounts or rails can open.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">5. Information We Collect</h2>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Annex A – Individual users (Easner Personal Banking)</h3>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>Full legal name, date of birth, nationality, and residential address</li>
          <li>Government-issued photo ID and proof of address where required</li>
          <li>Phone, email, and tax or national identifiers where applicable</li>
          <li>Employment, occupation, source of funds, and expected activity where required</li>
          <li>Selfie or liveness data where required for fraud prevention</li>
          <li>Verification status and related compliance metadata</li>
          <li>Local identity data where required for certain corridors (for example national ID numbers where applicable)</li>
        </ul>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Annex B – Business users (Easner Business Banking)</h3>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>Legal name, registration number, jurisdiction, and business address</li>
          <li>Business website and customer-facing contact details where required for KYB</li>
          <li>Industry, nature of business, tax IDs, and registration documents</li>
          <li>Beneficial owners and persons with significant control (typically 25% or more, or as required by law)</li>
          <li>Authorized signatories and their identity verification</li>
          <li>Source of funds, expected volumes, and operational details</li>
          <li>Team members with access to the business account, where required for access control</li>
          <li>Merchant / <strong>online payments</strong> details required by our payment processor when Connect or checkout card acceptance is enabled</li>
        </ul>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Document standards</h3>
        <p className="text-web-body leading-relaxed">
          Identity documents must be valid, legible, and match account information. Address documents are typically dated within the last three months unless otherwise specified. Non-English documents may require certified translation. We or our partners may request additional documents based on risk, product, or jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">6. Verification Process</h2>
        <ol className="list-decimal pl-6 space-y-2 text-web-body mb-4">
          <li>You create an Easner account.</li>
          <li>You complete <strong>hosted verification</strong> with a licensed partner (in-app, in-dashboard, or browser flow as offered for your product and jurisdiction).</li>
          <li>You may be asked to complete <strong>additional verification</strong> for another product or corridor (for example before sending to certain destinations or enabling online payments).</li>
          <li>Automated and, where needed, manual review is performed.</li>
          <li>Sanctions, PEP, and adverse media screening is conducted.</li>
          <li>You receive an outcome: approved, pending, rejected, or a request for more information.</li>
          <li>Upon approval, eligible accounts, payment rails, and features are provisioned according to your verification level and product enablement.</li>
        </ol>
        <p className="text-web-body leading-relaxed mb-4">
          Most verifications complete within <strong>1–3 business days</strong>. Complex cases may take longer.
        </p>
        <p className="text-web-body leading-relaxed">
          Verified profile information may be shared with payout partners as required to enable corridor services, in line with our <PolicyLink href="/privacy">Privacy Policy</PolicyLink>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">7. Our AML Program</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Easner’s AML framework includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li><strong>Customer Due Diligence (CDD)</strong> – KYC/KYB before regulated services are used</li>
          <li><strong>Enhanced Due Diligence (EDD)</strong> – for PEPs, high-risk geographies, unusual activity, or complex structures</li>
          <li><strong>Sanctions screening</strong> – of customers, beneficiaries, and transactions</li>
          <li><strong>Transaction monitoring</strong> – across fiat, stablecoin, wallet, payroll, and card-acceptance activity where enabled</li>
          <li><strong>Suspicious activity reporting</strong> – to relevant authorities when required</li>
          <li><strong>Recordkeeping</strong> – typically <strong>5 to 7 years</strong> after account closure or last activity, or longer where mandated</li>
          <li><strong>Training and governance</strong> – for personnel with compliance responsibilities, in coordination with licensed partners</li>
        </ul>
        <p className="text-web-body leading-relaxed mb-4">
          Licensed partners perform identity verification, screening, and much of the transaction monitoring underlying our Services. Easner integrates partner outputs into account decisions, limits, and escalation.
        </p>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Transaction monitoring</h3>
        <p className="text-web-body leading-relaxed mb-4">
          We and our partners review activity for indicators such as unusual size or frequency, structuring, inconsistent use versus profile, high-risk corridors, sanctions exposure, and – for business users – patterns inconsistent with invoicing, Terminal, QR Pay, payroll, or online card-acceptance activity.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          We may pause, decline, or request information about transactions pending compliance review.
        </p>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Suspicious activity reporting</h3>
        <p className="text-web-body leading-relaxed">
          Where we or a partner identify potentially suspicious activity, a <strong>Suspicious Activity Report</strong> or equivalent filing may be made to the appropriate authority. <strong>We cannot inform you</strong> when such a report is filed or an investigation is underway – this is required by law to prevent “tipping off.”
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">8. Verification and product access</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Access depends on successful verification, your jurisdiction, and which <strong>products</strong> are enabled — not on numbered “tiers.”
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Product
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                What it covers
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Typical requirement
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Global banking</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  USD and other core accounts, send and receive, regional corridors where enabled, stablecoin receive/send where enabled
                </td>
                <td className="px-4 py-3 align-top">
                  Approved account verification (individual or business)
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>More accounts</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Additional currency accounts (for example EUR, GBP) where offered
                </td>
                <td className="px-4 py-3 align-top">
                  Account verification; extra steps where required
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Online payments (Business)</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Card acceptance on invoices; settlement to Easner balance when enabled
                </td>
                <td className="px-4 py-3 align-top">
                  Business verification; merchant onboarding for card acceptance
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Cards</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Spend from balance in store or online
                </td>
                <td className="px-4 py-3 align-top">
                  Not generally available today; separate approval when launched
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Wallet and stablecoin</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Deposit addresses, wallet-initiated sends where enabled
                </td>
                <td className="px-4 py-3 align-top">
                  Account verification; Turnkey-backed signing (see Terms)
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed mb-4">
          Cross-border and local pay-in/pay-out corridors may be offered to eligible users with approved verification. Corridors are a capability under <strong>global banking</strong>, not a separate regional banking account product, unless we expressly launch one.
        </p>
        <p className="text-web-body leading-relaxed">
          <strong>Membership plans</strong> (Ease Plus, Ease Pro, and related) affect fees and feature limits described in the <PolicyLink href="/terms">Terms of Service</PolicyLink>; they do not replace KYC/KYB.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">9. Verification Outcomes and Limits</h2>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>Approved:</strong> You may use Services within your enabled products, limits, and partner availability.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>Pending:</strong> Some features may be restricted until review completes.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>Rejected:</strong> Common reasons include invalid documents, information mismatches, incomplete files, sanctions concerns, or jurisdiction ineligibility. You may be able to resubmit where permitted.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          We and our partners may impose transaction limits, corridor restrictions, or holds based on verification level and risk. Limits are communicated in the app or dashboard where practicable.
        </p>
        <p className="text-web-body leading-relaxed">
          Online payments may be limited or suspended independently based on payment processor, card-network, or Easner risk decisions.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">10. Your Responsibilities</h2>
        <p className="text-web-body leading-relaxed mb-4">
          You must:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>Provide accurate, complete, and current information</li>
          <li>Use the Services only for lawful purposes</li>
          <li>Cooperate with verification and information requests</li>
          <li>Notify us of changes to identity, ownership, or business activity</li>
          <li>Not evade sanctions, monitoring, or geographic restrictions</li>
        </ul>
        <p className="text-web-body leading-relaxed">
          False or misleading information may result in account closure and reporting to authorities.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">11. Your Rights</h2>
        <p className="text-web-body leading-relaxed mb-4">
          You may access verification status in the app or dashboard, request correction of inaccurate information (subject to regulatory limits), and contact us about the verification process. Some rights are limited by AML and recordkeeping laws.
        </p>
        <p className="text-web-body leading-relaxed">
          For data held by a licensed partner, contact <strong>legal@easner.com</strong> and we will coordinate where appropriate.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">12. Sharing and Security</h2>
        <p className="text-web-body leading-relaxed mb-4">
          We share KYC/KYB and compliance information with <strong>licensed partners</strong>, infrastructure providers (including <strong>Turnkey</strong> for wallet-related compliance metadata where applicable), regulators, law enforcement, and other institutions where permitted by law and necessary to provide or protect the Services. See our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> and <PolicyLink href="/legal/partners">Partners and service providers</PolicyLink>.
        </p>
        <p className="text-web-body leading-relaxed">
          We protect compliance data with encryption, access controls, and confidentiality training. Partners retain data under their own regulatory obligations, which may continue after your Easner account closes.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">13. Changes to This Policy</h2>
        <p className="text-web-body leading-relaxed">
          We may update this policy as regulations, partners, or our Services evolve. Material changes will be posted with an updated “Last updated” date.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">14. Contact Us</h2>
        <PolicyContactBlock />
      </section>
    </PolicyPageShell>
  )
}
