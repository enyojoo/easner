import { PolicyContactBlock, PolicyPageShell, PolicyLink, PolicyExternalLink } from "@/components/legal/policy-page-shell"


export function LegalHubPage() {
  return (
    <PolicyPageShell title="Legal" lastUpdated="November 6, 2026">
      <section>
        <p className="text-web-body leading-relaxed mb-4">
          Easner Group, Inc. (“Easner”) builds financial technology for global money movement. Easner is <strong>not a bank</strong>. Banking, money transmission, payment acceptance, verification, and related regulated services are provided by <strong>licensed partners</strong> under their licenses and terms. Wallet signing for digital asset features is provided by <strong>Turnkey</strong> under the self-custody model described in our Terms and Privacy Policy.
        </p>
        <p className="text-web-body leading-relaxed">
          For help, use <PolicyLink href="mailto:support@easner.com">support@easner.com</PolicyLink> or live chat in the app or Business dashboard.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Platform</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Policies that apply to all Easner products unless a product-specific notice says otherwise.
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Document
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Description
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/terms">Terms of Service</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Your agreement with Easner, including membership, Easner Checkout, and partner terms accepted in the flow.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/privacy">Privacy Policy</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  How we collect, use, share, and protect information.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Who may use Easner, verification, and anti-money laundering program.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/partners">Partners and service providers</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Named financial partners and technology subprocessors (maintained register).
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/delete-account">Delete your account</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Close Easner Personal Banking in the app; retention and business closure.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/law-enforcement">Law enforcement and subpoenas</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  How to submit legal process to Easner.
                </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Easner Personal Banking</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Consumer banking and payments through the Easner mobile app.
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Document
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Description
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/terms">Terms of Service</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Personal and Business share the same Terms; product sections describe Personal Banking.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/privacy">Privacy Policy</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Includes app permissions, wallet data, and membership billing.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Personal residence rules and verification.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/disclosures/personal-banking">Disclosure: Personal Banking</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Summary: not a bank, partner-provided rails, digital assets.
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed">
          <strong>Membership:</strong> Ease and paid plans (for example Ease Plus) are described in Terms § Membership and billing and in the app under More → Membership.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Easner Business Banking</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Business banking, payouts, payroll, collections, and online payments through the web dashboard.
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Document
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Description
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/terms">Terms of Service</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Payroll, collections, online payments, team access, and business responsibilities.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/privacy">Privacy Policy</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Business, payer, and workforce data submitted through your account.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Business jurisdiction rules and KYB.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/disclosures/business-banking">Disclosure: Business Banking</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Summary: not a bank, merchant and payroll responsibilities.
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed">
          <strong>Settings → Billing:</strong> Paid plans (Ease Plus, Ease Pro, and related tiers) bill through Easner Checkout; see Terms § Membership and billing.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Easner Checkout</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Hosted checkout, payment links, embed, customer portal, and subscriptions for businesses that sell to their own customers (and Easner’s own plan billing as merchant).
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Document
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Description
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/terms">Terms of Service</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Merchant obligations, chargebacks, and payer data (§ Easner Checkout).
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/privacy">Privacy Policy</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Payer and subscriber data processed for merchants and for Easner plan billing.
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed">
          Checkout pages show <strong>Terms</strong> and <strong>Privacy</strong> in the pay column; merchant-specific terms may apply when configured.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Digital assets and wallet</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Stablecoin receive, wallet sends, and related features where enabled.
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Document
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Description
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/disclosures/digital-assets">Disclosure: Digital assets and wallet</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Not bank deposits; Turnkey key management; irreversibility.
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/terms">Terms of Service</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Self-custody and flow of funds (§ Digital asset and wallet services).
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/privacy">Privacy Policy</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  § Digital assets.
                </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Incorporated partner terms</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Some regulated services require <strong>partner terms</strong> accepted in hosted onboarding or shown before a transaction. Easner-authored policies describe categories; partner terms govern the regulated relationship.
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Document
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Description
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/lightspark-eut">Lightspark Grid End User Terms</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Money transmission via Lightspark Grid when enabled for your account (also incorporated in <PolicyLink href="/terms">Terms of Service</PolicyLink>).
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/partners">Partners and service providers</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  Other partners; links to partner policies where public.
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed">
          Partner terms for Bridge, Noah, Yellowcard, Stripe, and others are presented <strong>in the flow</strong> when you use those services. The <PolicyLink href="/legal/partners">Partners</PolicyLink> page lists current entities and roles.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Disclosures</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Short summaries for each product line (not a substitute for Terms or Privacy).
        </p>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Document
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Description
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/disclosures/personal-banking">Easner Personal Banking</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/disclosures/business-banking">Easner Business Banking</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <PolicyLink href="/legal/disclosures/digital-assets">Digital assets and wallet</PolicyLink>
                </td>
                <td className="px-4 py-3 align-top">
                  
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed">
          Standard footer line used on statements and emails: Easner is a financial technology company, not a bank; regulated services are provided by licensed partners. More: <PolicyExternalLink href="https://www.easner.com/terms" analyticsLocation="legal_external_link">easner.com/terms</PolicyExternalLink>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Contact</h2>
        <PolicyContactBlock />
      </section>
    </PolicyPageShell>
  )
}
