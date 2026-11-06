import { PolicyPageShell, PolicyLink, PolicyExternalLink } from "@/components/legal/policy-page-shell"


export function PartnersPolicyPage() {
  return (
    <PolicyPageShell title="Partners and service providers" lastUpdated="November 6, 2026">
      <section>
        <p className="text-web-body leading-relaxed mb-4">
          Easner works with licensed financial partners, infrastructure providers, and technology subprocessors to deliver the Services. This page is the <strong>maintained register</strong> of entities that typically process personal information or provide regulated services for Easner products. Your experience may include only a subset, depending on product, jurisdiction, and features enabled.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>Hosted onboarding, funding instructions, and transaction receipts</strong> may identify the regulated provider for a specific service even when that provider is not listed below for your account.
        </p>
        <p className="text-web-body leading-relaxed">
          We may update this page when partners change. Material changes to subprocessors are reflected here and, where required, in our <PolicyLink href="/privacy">Privacy Policy</PolicyLink>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Financial and regulated partners</h2>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Legal name
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Role
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                U.S. NMLS or note
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Applies when (summary)
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Lightspark Payments, LLC</strong> (Grid)
                </td>
                <td className="px-4 py-3 align-top">
                  Licensed money transmission — KYB, virtual accounts, fund, payout, cross-border where Grid is enabled
                </td>
                <td className="px-4 py-3 align-top">
                  NMLS ID 2429193
                </td>
                <td className="px-4 py-3 align-top">
                  Eligible <strong>Easner Business Banking</strong> USD / global banking and related flows via Grid
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Bridge Building Inc.</strong> and Bridge-group entities
                </td>
                <td className="px-4 py-3 align-top">
                  Licensed money transmission and payments — KYC/KYB, virtual accounts, fiat pay-in and pay-out
                </td>
                <td className="px-4 py-3 align-top">
                  U.S. NMLS ID 2450917 (Bridge Building Inc.)
                </td>
                <td className="px-4 py-3 align-top">
                  Many <strong>Easner Personal Banking</strong> flows; eligible <strong>Easner Business Banking</strong> EUR and multi-currency accounts where Bridge is enabled
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Noah US, Inc.</strong> and Noah-group entities
                </td>
                <td className="px-4 py-3 align-top">
                  Licensed money transmission and payments — KYC, virtual accounts, fiat pay-in and pay-out
                </td>
                <td className="px-4 py-3 align-top">
                  U.S. NMLS ID 2696057 (Noah US, Inc.)
                </td>
                <td className="px-4 py-3 align-top">
                  Certain <strong>Easner Personal Banking</strong> and corridor flows where Noah is enabled
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Yellowcard</strong> (operating entities per corridor)
                </td>
                <td className="px-4 py-3 align-top">
                  Licensed payments / money movement — local and cross-border corridors
                </td>
                <td className="px-4 py-3 align-top">
                  Per entity and jurisdiction
                </td>
                <td className="px-4 py-3 align-top">
                  Corridor pay-in and pay-out where Yellowcard is enabled
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Stripe, Inc.</strong> and Stripe affiliates
                </td>
                <td className="px-4 py-3 align-top">
                  Payment processing — card acceptance (Stripe Connect), platform billing (Easner plans, Easner Checkout)
                </td>
                <td className="px-4 py-3 align-top">
                  Money transmitter / PI licenses as applicable
                </td>
                <td className="px-4 py-3 align-top">
                  Online payments on invoices; card and wallet pay on hosted checkout; Easner membership and merchant subscriptions
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Turnkey Global Inc.</strong> (Turnkey)
                </td>
                <td className="px-4 py-3 align-top">
                  Wallet and key-management infrastructure — deposit addresses, transaction signing (self-custody model)
                </td>
                <td className="px-4 py-3 align-top">
                  Infrastructure; not a money transmitter for user signing
                </td>
                <td className="px-4 py-3 align-top">
                  Wallet and stablecoin features where enabled; see <PolicyLink href="/legal/disclosures/digital-assets">Digital assets disclosure</PolicyLink>
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Sumsub</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Identity verification technology
                </td>
                <td className="px-4 py-3 align-top">
                  Service provider to partners and Easner
                </td>
                <td className="px-4 py-3 align-top">
                  Certain hosted KYC/KYB flows
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Relay</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Cross-chain bridging / routing
                </td>
                <td className="px-4 py-3 align-top">
                  Infrastructure
                </td>
                <td className="px-4 py-3 align-top">
                  Certain wallet sends where enabled
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed">
          Partner privacy policies and terms are linked from hosted verification and payment flows. Easner’s <PolicyLink href="/legal/lightspark-eut">Lightspark Grid End User Terms</PolicyLink> are incorporated into our <PolicyLink href="/terms">Terms of Service</PolicyLink> when Grid services apply.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Technology and support subprocessors</h2>
        <div className="my-4 overflow-x-auto rounded-[16px] border border-web-hairline">
          <table className="min-w-full text-sm text-web-body">
            <thead>
              <tr className="bg-web-plate">
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Provider
              </th>
              <th className="border-b border-web-hairline px-4 py-3 text-left font-semibold text-web-ink">
                Role
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Supabase</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Authentication, database, session storage
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>SendGrid</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Transactional email
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Expo</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Push notification delivery (mobile app)
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>PostHog</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  Product analytics and diagnostics
                </td>
            </tr>
            <tr className="border-b border-web-hairline last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <strong>Intercom</strong>
                </td>
                <td className="px-4 py-3 align-top">
                  In-app customer support and live chat
                </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>Sign in with Apple</strong> and <strong>Sign in with Google</strong> process authentication data under their own privacy policies when you use those sign-in options.
        </p>
        <p className="text-web-body leading-relaxed">
          GeoLite2 data created by <strong>MaxMind</strong> is used for approximate location from IP (<PolicyExternalLink href="https://www.maxmind.com" analyticsLocation="legal_external_link">maxmind.com</PolicyExternalLink>).
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Contact</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Questions about this list or your data: <PolicyLink href="mailto:legal@easner.com">legal@easner.com</PolicyLink> or <PolicyLink href="mailto:support@easner.com">support@easner.com</PolicyLink>.
        </p>
        <p className="text-web-body leading-relaxed">
          See also <PolicyLink href="/privacy">Privacy Policy</PolicyLink> § Service providers and partners.
        </p>
      </section>
    </PolicyPageShell>
  )
}
