import { PolicyPageShell, PolicyLink } from "@/components/legal/policy-page-shell"


export function DigitalAssetsDisclosurePage() {
  return (
    <PolicyPageShell title="Disclosure: Digital assets and wallet" lastUpdated="November 6, 2026">
      <section>
        <p className="text-web-body leading-relaxed">
          Where enabled, Easner may offer stablecoin capabilities (for example <strong>USDC</strong> and <strong>EURC</strong> on supported networks), deposit addresses, wallet-initiated sends, and related balance visibility in <strong>Easner Personal Banking</strong> or <strong>Easner Business Banking</strong>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Not bank deposits</h2>
        <p className="text-web-body leading-relaxed">
          Digital assets are <strong>not bank deposits</strong> and are <strong>not FDIC insured</strong>. The regulatory treatment of digital assets varies by jurisdiction. Blockchain transactions may be <strong>public</strong> and <strong>irreversible</strong>. You are responsible for correct wallet addresses, memos, and recipient details. Errors may result in permanent loss of funds.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Turnkey and self-custody</h2>
        <p className="text-web-body leading-relaxed mb-4">
          For Turnkey-backed wallet features, <strong>Easner does not sit in the flow of funds</strong> as a custodian or signing party:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>Easner does not sign or co-sign user transactions.</li>
          <li>Easner does not hold, custody, or export users’ private keys or seed phrases.</li>
          <li>Wallet keys and signing are managed within <strong>Turnkey Global Inc. (Turnkey)</strong> infrastructure.</li>
          <li>Easner controls <strong>product access</strong> (who can initiate actions in our UI or API), not transaction signing after submission.</li>
        </ul>
        <p className="text-web-body leading-relaxed mb-4">
          Product access blocks (verification, security, or compliance) are not the ability to alter, cancel, or reverse a transaction once it has been signed and submitted on-chain.
        </p>
        <p className="text-web-body leading-relaxed">
          Fiat money-transmission and virtual-account rails remain separate from this wallet model and are provided by licensed partners under their terms.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Cross-chain routing</h2>
        <p className="text-web-body leading-relaxed">
          Certain wallet sends may use a <strong>cross-chain routing or bridging provider</strong> where enabled. Easner does not control public blockchains.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">More information</h2>
        <p className="text-web-body leading-relaxed">
          <PolicyLink href="/terms">Terms of Service</PolicyLink> · <PolicyLink href="/privacy">Privacy Policy</PolicyLink> § Digital assets · <PolicyLink href="/legal/partners">Partners</PolicyLink>
        </p>
      </section>
    </PolicyPageShell>
  )
}
