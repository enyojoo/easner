import { PolicyLink, PolicyPageShell } from "@/components/legal/policy-page-shell"
import { MarketingLink } from "@/components/marketing/marketing-link"

function Mailto({
  email,
  analyticsLocation,
}: {
  email: string
  analyticsLocation: string
}) {
  return (
    <MarketingLink
      href={`mailto:${email}`}
      analyticsLocation={analyticsLocation}
      ctaLabel={email}
      className="font-semibold text-[#007ACC] hover:underline"
    >
      {email}
    </MarketingLink>
  )
}

export function DeleteAccountPage() {
  return (
    <PolicyPageShell title="Delete Your Easner Account" lastUpdated="August 28, 2026">
      <section>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          <strong>Easner Group, Inc.</strong> (“Easner,” “we,” “us,” or “our”) provides this page so users of{" "}
          <strong>Easner Personal Banking</strong> (the Easner mobile app) can understand how to request account deletion and what happens to their data.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          This page applies to personal accounts created in the Easner mobile app. If you use{" "}
          <strong>Easner Business Banking</strong>, see{" "}
          <PolicyLink href="#request-deletion-without-the-app">Request deletion without the app</PolicyLink> below.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">Delete your account in the app</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          You can delete your Easner Personal Banking account yourself at any time from the app:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Open the <strong>Easner</strong> app and sign in.</li>
          <li>Go to the <strong>More</strong> tab (bottom navigation).</li>
          <li>Open <strong>Profile</strong>.</li>
          <li>Scroll to the bottom and tap <strong>Delete Account</strong>.</li>
          <li>Read the confirmation message, then tap <strong>Close Account in 7 Days</strong>.</li>
        </ol>
        <p className="text-[#5F665F] leading-relaxed">
          You can also open <strong>Profile</strong> from your dashboard avatar or header, depending on your device.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">What happens when you delete your account</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">When you confirm deletion:</p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            Your account is <strong>scheduled for closure</strong> after a <strong>7-day grace period</strong>.
          </li>
          <li>
            During those 7 days, you can <strong>sign back in at any time</strong> to <strong>cancel</strong> the deletion. Signing in automatically cancels the pending closure.
          </li>
          <li>
            After the grace period ends:
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                Your <strong>login credentials are removed</strong> and you will no longer be able to sign in.
              </li>
              <li>
                <strong>Push notification registrations</strong> for your account are removed.
              </li>
              <li>
                Your account is marked <strong>closed</strong> in our systems.
              </li>
            </ul>
          </li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Data we delete or stop using</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          After closure, we stop using your account for active banking services and remove access credentials, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Authentication and session data (Supabase auth user)</li>
          <li>Push notification device tokens tied to your account</li>
        </ul>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Data we may keep</h3>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Easner is a financial technology company subject to KYC, AML, sanctions, and recordkeeping rules. Even after your account is closed, we and our licensed partners may{" "}
          <strong>retain certain information</strong> as required by law and our agreements, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>Identity and verification records (for example government ID, verification outcomes)</li>
          <li>Transaction, payment, payout, and account history</li>
          <li>Support and compliance communications</li>
          <li>Records needed for fraud prevention, dispute resolution, tax reporting, and regulatory audits</li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          As described in our <PolicyLink href="/privacy">Privacy Policy</PolicyLink>, financial services recordkeeping often requires retention for{" "}
          <strong>5 to 7 years or longer</strong> after account closure or last activity. Partners may retain records under their own regulatory obligations.
        </p>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          We <strong>do not sell</strong> personal information.
        </p>
        <p className="text-[#5F665F] leading-relaxed">
          For full details on categories of data, retention, and your privacy rights, see our{" "}
          <PolicyLink href="/privacy">Privacy Policy</PolicyLink> and <PolicyLink href="/terms">Terms of Service</PolicyLink>.
        </p>
      </section>

      <section id="request-deletion-without-the-app" className="scroll-mt-28">
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">Request deletion without the app</h2>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          If you <strong>cannot access the app</strong> (lost device, sign-in issues, or account already closed), email us from the address on your Easner account:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F] mb-4">
          <li>
            <Mailto email="support@easner.com" analyticsLocation="delete_account_support_email" />
          </li>
          <li>
            <Mailto email="legal@easner.com" analyticsLocation="delete_account_legal_email" /> (include “Account deletion request” in the subject line)
          </li>
        </ul>
        <p className="text-[#5F665F] leading-relaxed mb-4">
          Include your full name and the email address registered to your account. We may ask for information to verify your identity before processing the request.
        </p>
        <h3 className="text-lg font-semibold text-[#0F1110] mb-2">Easner Business Banking</h3>
        <p className="text-[#5F665F] leading-relaxed">
          If you have an <strong>Easner Business</strong> account, contact{" "}
          <Mailto email="support@easner.com" analyticsLocation="delete_account_business_support_email" /> or use in-app support in the Business dashboard. Business account closure may require additional steps (for example settling balances, payroll, or open invoices).
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">Partial data deletion</h2>
        <p className="text-[#5F665F] leading-relaxed">
          Easner does <strong>not</strong> currently offer a separate self-serve option to delete individual data fields without closing your account. You may update certain profile information in the app (for example name or phone number). To exercise access, correction, or deletion rights under applicable privacy laws, contact{" "}
          <Mailto email="legal@easner.com" analyticsLocation="delete_account_partial_legal_email" /> or{" "}
          <Mailto email="support@easner.com" analyticsLocation="delete_account_partial_support_email" />.
        </p>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">Questions or restore access</h2>
        <ul className="list-disc pl-6 space-y-2 text-[#5F665F]">
          <li>
            <strong>Cancel a pending deletion:</strong> Sign back in to the Easner app within 7 days of requesting deletion.
          </li>
          <li>
            <strong>Closed account help:</strong> If your account has already been closed and you believe this was a mistake, contact{" "}
            <Mailto email="support@easner.com" analyticsLocation="delete_account_restore_email" />.
          </li>
          <li>
            <strong>General support:</strong> <PolicyLink href="/contact">Contact Easner</PolicyLink> or use live chat in the app.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-unbounded text-2xl font-bold text-[#0F1110] mb-4">Contact</h2>
        <div className="mt-4 rounded-2xl border border-[#E4DED1] bg-[#F8F6F0] p-5 text-sm leading-7 text-[#5F665F] sm:text-base">
          <p>
            <strong className="text-[#0F1110]">Easner Group, Inc.</strong>
            <br />
            584 Castro St, Suite 4092
            <br />
            San Francisco, CA 94114, United States
            <br />
            <br />
            <strong className="text-[#0F1110]">Support:</strong>{" "}
            <Mailto email="support@easner.com" analyticsLocation="delete_account_contact_support_email" />
            <br />
            <strong className="text-[#0F1110]">Legal / privacy:</strong>{" "}
            <Mailto email="legal@easner.com" analyticsLocation="delete_account_contact_legal_email" />
            <br />
            <strong className="text-[#0F1110]">Phone:</strong> +1 628 228 6083
            <br />
            <strong className="text-[#0F1110]">Website:</strong>{" "}
            <PolicyLink href="/" analyticsLocation="delete_account_contact_website">
              www.easner.com
            </PolicyLink>
          </p>
        </div>
      </section>
    </PolicyPageShell>
  )
}
