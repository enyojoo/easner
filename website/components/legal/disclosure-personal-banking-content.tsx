import { PolicyPageShell, PolicyLink } from "@/components/legal/policy-page-shell"


export function PersonalBankingDisclosurePage() {
  return (
    <PolicyPageShell title="Disclosure: Easner Personal Banking" lastUpdated="November 6, 2026">
      <section>
        <p className="text-web-body leading-relaxed">
          <strong>Easner Personal Banking</strong> is the consumer banking and payments experience in the Easner mobile app, offered by <strong>Easner Group, Inc.</strong>
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Easner is not a bank</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Easner is a <strong>financial technology company, not a bank</strong>. Easner does not offer FDIC or equivalent deposit insurance and does not itself hold customer deposits.
        </p>
        <p className="text-web-body leading-relaxed">
          Identity verification, virtual accounts, fiat pay-in and pay-out, money transmission, and card acceptance (where enabled) are provided by <strong>licensed partners</strong> under their licenses and terms. The regulated provider for a specific service is identified in hosted onboarding, funding instructions, and transaction records where required.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Products and verification</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Access depends on successful <strong>verification</strong>, your jurisdiction, and product availability — not on numbered “tiers.” Typical products include <strong>global banking</strong> (accounts, send and receive, corridors where enabled), <strong>more accounts</strong> (additional currencies where offered), <strong>cards</strong> (when launched), and <strong>wallet / stablecoin</strong> features where enabled. Additional verification steps may be required for certain destinations or products.
        </p>
        <p className="text-web-body leading-relaxed">
          See the <PolicyLink href="/compliance">KYC/KYB and AML Policy</PolicyLink> for residence rules.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Digital assets</h2>
        <p className="text-web-body leading-relaxed">
          Digital asset and stablecoin features are <strong>not bank deposits</strong> and are not FDIC insured. Wallet keys and signing for Turnkey-backed features are managed in <strong>Turnkey’s</strong> infrastructure; Easner is not a custodian or signing party. See <PolicyLink href="/legal/disclosures/digital-assets">Digital assets and wallet</PolicyLink>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Membership</h2>
        <p className="text-web-body leading-relaxed">
          Paid plans (for example <strong>Ease Plus</strong>) are optional subscriptions billed through Easner Checkout. Plan fees, benefits, and cancellation are described in the <PolicyLink href="/terms">Terms of Service</PolicyLink> and in the app under More → Membership.
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
