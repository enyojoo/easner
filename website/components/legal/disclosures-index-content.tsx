import { PolicyLink, PolicyPageShell } from "@/components/legal/policy-page-shell"

export function DisclosuresIndexPage() {
  return (
    <PolicyPageShell title="Product disclosures" lastUpdated="November 6, 2026">
      <section>
        <p className="text-web-body leading-relaxed mb-4">
          Short summaries for each product line. These are not a substitute for the{" "}
          <PolicyLink href="/terms">Terms of Service</PolicyLink> or <PolicyLink href="/privacy">Privacy Policy</PolicyLink>.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body">
          <li>
            <PolicyLink href="/legal/disclosures/personal-banking">Easner Personal Banking</PolicyLink>
          </li>
          <li>
            <PolicyLink href="/legal/disclosures/business-banking">Easner Business Banking</PolicyLink>
          </li>
          <li>
            <PolicyLink href="/legal/disclosures/digital-assets">Digital assets and wallet</PolicyLink>
          </li>
        </ul>
        <p className="text-web-body leading-relaxed mt-6">
          <PolicyLink href="/legal">Back to Legal</PolicyLink>
        </p>
      </section>
    </PolicyPageShell>
  )
}
