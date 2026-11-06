import { PolicyPageShell, PolicyLink } from "@/components/legal/policy-page-shell"


export function BusinessBankingDisclosurePage() {
  return (
    <PolicyPageShell title="Disclosure: Easner Business Banking" lastUpdated="November 6, 2026">
      <section>
        <p className="text-web-body leading-relaxed">
          <strong>Easner Business Banking</strong> is the business banking, payouts, payroll, collections, and online payments experience on the Easner web dashboard, offered by <strong>Easner Group, Inc.</strong>
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Easner is not a bank</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Easner is a <strong>financial technology company, not a bank</strong>. Easner does not offer FDIC or equivalent deposit insurance and does not itself hold customer deposits.
        </p>
        <p className="text-web-body leading-relaxed">
          KYB, virtual accounts, money transmission, corridor payouts, and card acceptance (where enabled) are provided by <strong>licensed partners</strong> under their licenses and terms. The regulated provider for a specific service is identified in hosted onboarding, funding instructions, and transaction records where required.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Products and verification</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Access depends on successful <strong>business verification</strong>, jurisdiction, and enabled features. Typical products include <strong>global banking</strong>, <strong>more accounts</strong>, <strong>online payments</strong> (card acceptance on invoices via Stripe Connect where enabled), <strong>payroll</strong>, <strong>collections</strong> (invoicing, Terminal, QR Pay), and <strong>wallet / stablecoin</strong> features where enabled. Additional verification may be required for certain corridors or for online payments merchant onboarding.
        </p>
        <p className="text-web-body leading-relaxed">
          See the <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink> for business jurisdiction rules.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Your responsibilities</h2>
        <p className="text-web-body leading-relaxed">
          You are responsible for authorized users on your account, accurate ownership and KYB information, lawful use of payroll and collections, tax and employment compliance for payroll, and card-network and processor rules for online payments.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Membership and Easner Checkout</h2>
        <p className="text-web-body leading-relaxed">
          Business <strong>Ease</strong> plans (Ease Plus, Ease Pro, and related) are described in Settings → Billing and in the <PolicyLink href="/terms">Terms of Service</PolicyLink>. Easner Checkout powers hosted checkout for your customers and plan billing for your business where enabled.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Digital assets</h2>
        <p className="text-web-body leading-relaxed">
          See <PolicyLink href="/legal/disclosures/digital-assets">Digital assets and wallet</PolicyLink>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">More information</h2>
        <p className="text-web-body leading-relaxed">
          <PolicyLink href="/terms">Terms of Service</PolicyLink> · <PolicyLink href="/privacy">Privacy Policy</PolicyLink> · <PolicyLink href="/legal">Legal hub</PolicyLink>
        </p>
      </section>
    </PolicyPageShell>
  )
}
