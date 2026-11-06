import { PolicyPageShell, PolicyLink } from "@/components/legal/policy-page-shell"


export function LawEnforcementPage() {
  return (
    <PolicyPageShell title="Law enforcement and subpoenas" lastUpdated="November 6, 2026">
      <section>
        <p className="text-web-body leading-relaxed">
          Easner Group, Inc. (“Easner”) responds to valid legal process and lawful requests from government and law enforcement agencies in accordance with applicable law.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">How to submit a request</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Email <strong>legal@easner.com</strong> with:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>Agency name and contact details</li>
          <li>The legal authority for the request (subpoena, court order, search warrant, or other compulsory process)</li>
          <li>Scope of data sought (account identifiers, date range, types of records)</li>
          <li>Whether the request permits disclosure to the customer (gag orders and applicable law noted)</li>
        </ul>
        <p className="text-web-body leading-relaxed mb-4">
          For emergencies involving imminent harm, include “Emergency disclosure request” in the subject line and describe the nature of the emergency.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          <strong>Mailing address:</strong>
        </p>
        <p className="text-web-body leading-relaxed">
          Easner Group, Inc. 584 Castro St, Suite 4092 San Francisco, CA 94114 United States
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">What we can provide</h2>
        <p className="text-web-body leading-relaxed mb-4">
          Depending on the request and applicable law, we may be able to provide account and profile information, verification status, transaction and payment metadata, and support communications <strong>held by Easner</strong>. Regulated partners (money transmission, card processing, verification hosts) may hold additional records under their own obligations; we will coordinate where appropriate.
        </p>
        <p className="text-web-body leading-relaxed">
          We do not provide users’ private keys or seed phrases. Turnkey-backed wallet signing is managed in Turnkey’s infrastructure; Easner does not custody or export keys.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Customer notice</h2>
        <p className="text-web-body leading-relaxed">
          Where permitted, we notify account holders before producing records. We may delay or limit notice when legally required.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Questions</h2>
        <p className="text-web-body leading-relaxed">
          Non-law-enforcement privacy rights: see <PolicyLink href="/privacy">Privacy Policy</PolicyLink> § Your rights. General support: <PolicyLink href="mailto:support@easner.com">support@easner.com</PolicyLink>.
        </p>
      </section>
    </PolicyPageShell>
  )
}
