import { PolicyContactBlock, PolicyPageShell, PolicyLink } from "@/components/legal/policy-page-shell"


export function DeleteAccountPage() {
  return (
    <PolicyPageShell title="Delete your Easner account" lastUpdated="November 6, 2026">
      <section>
        <p className="text-web-body leading-relaxed mb-4">
          Easner Group, Inc. (“Easner,” “we,” “us,” or “our”) provides this page so users of <strong>Easner Personal Banking</strong> (the Easner mobile app) can understand how to request account deletion and what happens to their data.
        </p>
        <p className="text-web-body leading-relaxed">
          This page applies to personal accounts created in the Easner mobile app. If you use <strong>Easner Business Banking</strong>, see <PolicyLink href="#request-deletion-without-the-app">Request deletion without the app</PolicyLink> below.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Delete your account in the app</h2>
        <p className="text-web-body leading-relaxed mb-4">
          You can delete your Easner Personal Banking account yourself at any time from the app:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-web-body mb-4">
          <li>Open the Easner app and sign in.</li>
          <li>Go to the <strong>More</strong> tab (bottom navigation).</li>
          <li>Open <strong>Profile</strong>.</li>
          <li>Scroll to the bottom and tap <strong>Delete account</strong>.</li>
          <li>Read the confirmation message, then tap <strong>Close account in 7 days</strong>.</li>
        </ol>
        <p className="text-web-body leading-relaxed">
          You can also open Profile from your dashboard avatar or header, depending on your device.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">What happens when you delete your account</h2>
        <p className="text-web-body leading-relaxed mb-4">
          When you confirm deletion:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>Your account is scheduled for closure after a <strong>7-day grace period</strong>.</li>
          <li>During those 7 days, you can sign back in at any time to <strong>cancel</strong> the deletion. Signing in automatically cancels the pending closure.</li>
          <li>After the grace period ends:
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>Your login credentials are removed and you will no longer be able to sign in.</li>
              <li>Push notification registrations for your account are removed.</li>
              <li>Your account is marked closed in our systems.</li>
            </ul></li>
        </ul>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Data we delete or stop using</h3>
        <p className="text-web-body leading-relaxed mb-4">
          After closure, we stop using your account for active banking services and remove access credentials, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>Authentication and session data</li>
          <li>Push notification device tokens tied to your account</li>
        </ul>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Data we may keep</h3>
        <p className="text-web-body leading-relaxed mb-4">
          Easner is a financial technology company subject to KYC, AML, sanctions, and recordkeeping rules. Even after your account is closed, we and our <strong>licensed partners</strong> may retain certain information as required by law and our agreements, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li>Identity and verification records (for example government ID, verification outcomes)</li>
          <li>Transaction, payment, payout, and account history</li>
          <li>Support and compliance communications</li>
          <li>Records needed for fraud prevention, dispute resolution, tax reporting, and regulatory audits</li>
        </ul>
        <p className="text-web-body leading-relaxed mb-4">
          As described in our <PolicyLink href="/privacy">Privacy Policy</PolicyLink>, financial services recordkeeping often requires retention for <strong>5 to 7 years</strong> or longer after account closure or last activity. Partners may retain records under their own regulatory obligations.
        </p>
        <p className="text-web-body leading-relaxed mb-4">
          We do not sell personal information.
        </p>
        <p className="text-web-body leading-relaxed">
          For full details on categories of data, retention, and your privacy rights, see our <PolicyLink href="/privacy">Privacy Policy</PolicyLink> and <PolicyLink href="/terms">Terms of Service</PolicyLink>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Request deletion without the app</h2>
        <p className="text-web-body leading-relaxed mb-4">
          If you cannot access the app (lost device, sign-in issues, or account already closed), email us from the address on your Easner account:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li><PolicyLink href="mailto:support@easner.com">support@easner.com</PolicyLink></li>
          <li><PolicyLink href="mailto:legal@easner.com">legal@easner.com</PolicyLink> (include “Account deletion request” in the subject line)</li>
        </ul>
        <p className="text-web-body leading-relaxed mb-4">
          Include your full name and the email address registered to your account. We may ask for information to verify your identity before processing the request.
        </p>
        <h3 className="text-lg font-semibold text-web-ink mb-2">Easner Business Banking</h3>
        <p className="text-web-body leading-relaxed">
          If you have an Easner Business account, contact <PolicyLink href="mailto:support@easner.com">support@easner.com</PolicyLink> or use in-app support in the Business dashboard. Business account closure may require additional steps (for example settling balances, payroll, or open invoices).
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Partial data deletion</h2>
        <p className="text-web-body leading-relaxed">
          Easner does not currently offer a separate self-serve option to delete individual data fields without closing your account. You may update certain profile information in the app (for example name or phone number). To exercise access, correction, or deletion rights under applicable privacy laws, contact <PolicyLink href="mailto:legal@easner.com">legal@easner.com</PolicyLink> or <PolicyLink href="mailto:support@easner.com">support@easner.com</PolicyLink>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Questions or restore access</h2>
        <ul className="list-disc pl-6 space-y-2 text-web-body mb-4">
          <li><strong>Cancel a pending deletion:</strong> Sign back in to the Easner app within 7 days of requesting deletion.</li>
          <li><strong>Closed account help:</strong> If your account has already been closed and you believe this was a mistake, contact <PolicyLink href="mailto:support@easner.com">support@easner.com</PolicyLink>.</li>
          <li><strong>General support:</strong> Contact Easner or use live chat in the app.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-web-ink mb-4">Contact</h2>
        <PolicyContactBlock />
        <p className="text-web-body leading-relaxed">
          <strong>Support:</strong> <PolicyLink href="mailto:support@easner.com">support@easner.com</PolicyLink> <strong>Legal / privacy:</strong> <PolicyLink href="mailto:legal@easner.com">legal@easner.com</PolicyLink> <strong>Phone:</strong> +1 628 228 6083 <strong>Website:</strong> www.easner.com
        </p>
      </section>
    </PolicyPageShell>
  )
}
