import type { ReactNode } from "react"
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, CreditCard, FileText, Landmark, Link2, LockKeyhole, Users2 } from "lucide-react"
import { CurrencyBadge } from "./currency-badge"
import { PaymentStatus } from "./account-mockups"

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="@container flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCE2E5] bg-white text-[#152A38] tabular-nums"><div className="flex h-9 shrink-0 items-center justify-between border-b border-[#E8ECEE] bg-[#FAFBFC] px-3 text-[11px]"><span className="font-semibold text-[#0064A8]">Easner</span><span className="text-[#63717B]">{title}</span></div><div className="flex min-h-0 flex-1 flex-col p-3 @[450px]:p-4">{children}</div></div>
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex items-center justify-between gap-3 py-1.5 text-[11px]"><span className="text-[#63717B]">{label}</span><span className="text-right font-medium">{value}</span></div>
}

export function BusinessFeatureMockup({ kind }: { kind: "accounts" | "send" | "collections" | "team" }) {
  if (kind === "accounts") return (
    <Panel title="Account details">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Your account, in your name</p>
        <div className="flex shrink-0 gap-1">
          <span className="rounded-full bg-[#EAF5FD] px-2 py-1 text-[10px] font-semibold text-[#0064A8]">USD</span>
          <span className="rounded-full bg-[#F0F3F5] px-2 py-1 text-[10px] text-[#54616D]">EUR</span>
          <span className="rounded-full bg-[#F0F3F5] px-2 py-1 text-[10px] text-[#54616D]">GBP</span>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-[#E3E8EB] bg-[#FAFBFC] px-3 py-1">
        <Row label="Account name" value="Oakridge Studio" />
        <Row label="Account number" value="•••• 9012" />
        <Row label="Routing number" value="•••• 0021" />
      </div>
      <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-[#0064A8]"><Landmark aria-hidden="true" className="size-3.5" />Share these details to get paid</div>
    </Panel>
  )
  if (kind === "send") return (
    <Panel title="Supplier payment">
      <div className="flex items-center justify-between"><div><p className="text-[10px] text-[#63717B]">Paying</p><p className="mt-0.5 text-sm font-semibold">Meridian Supplies</p></div><span className="flex size-8 items-center justify-center rounded-full bg-[#EAF5FD] text-[#0064A8]"><ArrowUpRight className="size-4" aria-hidden="true" /></span></div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F0F8FE] p-3"><span className="text-2xl font-semibold">$12,400.00</span><CurrencyBadge code="USD" labelClassName="text-[11px]" /></div>
      <Row label="Payment method" value="Bank transfer" /><Row label="Reference" value="PO-2026-044" />
      <div className="mt-auto flex items-center justify-between gap-2 pt-2"><span className="text-[10px] text-[#63717B]">Review fees before confirming</span><span className="rounded-full bg-[#007ACC] px-3 py-2 text-[11px] font-semibold text-white">Review</span></div>
    </Panel>
  )
  if (kind === "collections") return (
    <Panel title="Customer payments">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold">Payments received</p><PaymentStatus>Received</PaymentStatus></div>
      <div className="mt-2 divide-y divide-[#E8ECEE]">
        {[{ label: "Northstar Studio", method: "Invoice INV-1042", amount: "+$4,800" }, { label: "Consulting retainer", method: "Payment Link", amount: "+$500" }, { label: "Product subscription", method: "Checkout", amount: "+$49" }].map((payment) => (
          <div key={payment.method} className="flex items-center gap-2 py-2"><ArrowDownLeft className="size-4 shrink-0 text-[#176342]" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-[11px] font-medium">{payment.label}</p><p className="mt-0.5 text-[10px] text-[#63717B]">{payment.method}</p></div><span className="text-[11px] font-semibold text-[#176342]">{payment.amount}</span></div>
        ))}
      </div>
    </Panel>
  )
  return (
    <Panel title="Team access">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold">The right access for each role</p><Users2 aria-hidden="true" className="size-4 text-[#0064A8]" /></div>
      <div className="mt-2 divide-y divide-[#E8ECEE]">
        {[{ name: "Maya Reed", initials: "MR", role: "Admin" }, { name: "Daniel Cole", initials: "DC", role: "Finance" }, { name: "Nuel King", initials: "NK", role: "View only" }].map((person) => (
          <div key={person.name} className="flex items-center gap-2 py-2"><span className="flex size-7 items-center justify-center rounded-full bg-[#EEF4FA] text-[10px] font-semibold text-[#0064A8]">{person.initials}</span><span className="flex-1 text-[11px] font-medium">{person.name}</span><span className="rounded-full bg-[#F0F3F5] px-2 py-1 text-[10px] text-[#54616D]">{person.role}</span></div>
        ))}
      </div>
    </Panel>
  )
}

export function InvoiceDocumentMockup({ draft = false }: { draft?: boolean }) {
  return (
    <Panel title={draft ? "Create an invoice" : "International invoicing"}>
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] text-[#63717B]">Oakridge Studio · INV-1042</p><p className="mt-1 text-base font-semibold">Invoice for Northstar Studio</p></div><FileText aria-hidden="true" className="size-5 shrink-0 text-[#0064A8]" /></div>
      <div className="mt-3 rounded-xl border border-[#E3E8EB] bg-[#FAFBFC] px-3 py-1"><Row label="Platform integration" value="$3,200.00" /><Row label="Support retainer" value="$1,600.00" /><div className="border-t border-[#E3E8EB]"><Row label="Invoice total · USD" value="$4,800.00" /></div></div>
      {draft ? <div className="mt-auto flex justify-end gap-2 pt-3 text-[11px] font-semibold"><span className="rounded-full bg-[#F0F3F5] px-3 py-2 text-[#54616D]">Save draft</span><span className="rounded-full bg-[#007ACC] px-3 py-2 text-white">Send invoice</span></div> : <><div className="mt-4 flex items-center justify-between"><p className="text-sm font-semibold">Payment received</p><PaymentStatus>Paid</PaymentStatus></div><p className="mt-2 text-[11px] leading-5 text-[#63717B]">$4,800.00 received by bank transfer and matched to INV-1042.</p><div className="mt-auto rounded-xl bg-[#F0F8FE] p-3 text-[11px] text-[#0064A8]">Invoice and payment, together in your records.</div></>}
    </Panel>
  )
}

export function CustomerPaymentMockup({ paymentLink = false }: { paymentLink?: boolean }) {
  return (
    <Panel title={paymentLink ? "Payment Link" : "Website checkout"}>
      <div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FD] text-[#0064A8]">{paymentLink ? <Link2 className="size-4" aria-hidden="true" /> : <CreditCard className="size-4" aria-hidden="true" />}</span><div><p className="text-sm font-semibold">{paymentLink ? "Consulting retainer" : "Nova Analytics Pro"}</p><p className="mt-0.5 text-[11px] text-[#63717B]">{paymentLink ? "Requested by Oakridge Studio" : "Monthly subscription"}</p></div></div>
      <div className="my-4 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight">{paymentLink ? "$500.00" : "$49.00"}</span><span className="text-[11px] text-[#63717B]">{paymentLink ? "one-time" : "/ month"}</span></div>
      <p className="mb-2 text-[11px] font-semibold">Choose a payment method</p>
      <div className="grid grid-cols-2 gap-2"><span className="flex items-center gap-2 rounded-xl border border-[#9DCBEB] bg-[#F0F8FE] p-3 text-[11px] font-medium text-[#0064A8]"><CreditCard className="size-4" aria-hidden="true" />Card</span><span className="flex items-center gap-2 rounded-xl border border-[#E3E8EB] p-3 text-[11px]"><Landmark className="size-4" aria-hidden="true" />Bank</span></div>
      <div className="mt-3 rounded-full bg-[#007ACC] py-3 text-center text-xs font-semibold text-white">{paymentLink ? "Pay $500.00" : "Subscribe for $49 / month"}</div>
      <div className="mt-auto flex items-center justify-center gap-1.5 pt-3 text-[10px] text-[#63717B]"><LockKeyhole className="size-3" aria-hidden="true" />{paymentLink ? "Payment page by Easner" : "Renews monthly until cancelled"}</div>
    </Panel>
  )
}

export function PayrollRunMockup() {
  const payees = [{ name: "Amara Okafor", amount: "$1,200.00" }, { name: "Daniel Cole", amount: "$3,200.00" }, { name: "Maya Reed", amount: "$1,800.00" }]
  return (
    <Panel title="Payroll">
      <div className="flex items-center justify-between gap-2"><p className="text-base font-semibold">September pay run</p><span className="rounded-full bg-[#FFF5DE] px-2 py-1 text-[10px] font-medium text-[#815700]">Awaiting approval</span></div>
      <div className="mt-3 rounded-xl bg-[#F0F8FE] p-3"><p className="text-[11px] text-[#63717B]">3 payees · USD</p><p className="mt-1 text-2xl font-semibold">$6,200.00</p></div>
      <div className="mt-2 divide-y divide-[#E8ECEE]">{payees.map((payee) => <Row key={payee.name} label={payee.name} value={payee.amount} />)}</div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-3"><span className="flex items-center gap-1 text-[10px] text-[#63717B]"><CheckCircle2 className="size-3" aria-hidden="true" />Ready for review</span><span className="rounded-full bg-[#007ACC] px-3 py-2 text-[11px] font-semibold text-white">Review payroll</span></div>
    </Panel>
  )
}

export function InvoiceDetailsMockup({ stablecoin = false }: { stablecoin?: boolean }) {
  return (
    <Panel title="Invoice payment details">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold">INV-1042</p><span className="text-lg font-semibold">$4,800.00</span></div>
      <div className="mt-3 rounded-xl bg-[#F0F8FE] px-3 py-2"><p className="mb-1 text-[11px] font-semibold text-[#0064A8]">{stablecoin ? "Pay with stablecoin" : "Pay by bank transfer"}</p>
        {stablecoin ? <><Row label="Asset / network" value="USDC / Ethereum" /><Row label="Deposit address" value="0x7a2f…9c4b" /><Row label="Reference" value="INV-1042" /></> : <><Row label="Account name" value="Oakridge Studio" /><Row label="Account details" value="•••• 9012" /><Row label="Reference" value="INV-1042" /></>}
      </div>
      <p className="mt-auto pt-3 text-[10px] leading-4 text-[#63717B]">{stablecoin ? "Use the asset, network, and instructions shown on your invoice." : "Use the account details and payment reference shown on your invoice."}</p>
    </Panel>
  )
}

export function InvoiceCustomersPreview() {
  return <Panel title="Customer directory"><p className="mb-2 text-sm font-semibold">Your repeat customers</p><div className="divide-y divide-[#E8ECEE]">{[{ name: "Northstar Studio", email: "accounts@example.com", invoice: "INV-1042 · $4,800" }, { name: "Nova Consultancy", email: "finance@example.com", invoice: "INV-1031 · $6,250" }].map((customer) => <div key={customer.name} className="py-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">{customer.name}</p><span className="text-[10px] text-[#63717B]">{customer.invoice}</span></div><p className="mt-1 text-[10px] text-[#63717B]">{customer.email}</p></div>)}</div><p className="mt-auto pt-2 text-[11px] text-[#0064A8]">Customer details ready for your next invoice</p></Panel>
}

export function StablecoinTransferPreview() {
  return <Panel title="Review stablecoin payment"><p className="text-sm font-semibold">Send to Meridian Supplies</p><div className="my-3 rounded-xl bg-[#F0F8FE] p-3"><p className="text-[10px] text-[#63717B]">Send amount</p><p className="mt-1 text-2xl font-semibold">8,400 <span className="text-xs text-[#0064A8]">USDC</span></p></div><Row label="Network" value="Ethereum" /><Row label="Destination" value="0x4b8c…1f2a" /><div className="mt-auto flex items-center justify-between gap-2 pt-2"><span className="text-[10px] text-[#63717B]">Review the network fee before sending</span><span className="rounded-full bg-[#007ACC] px-3 py-2 text-[11px] font-semibold text-white">Continue</span></div></Panel>
}

export function CardsPreview() {
  const cards = [
    { label: "Virtual", ending: "9041", color: "bg-[#007ACC]", position: "left-0 top-0" },
    { label: "Physical", ending: "4829", color: "bg-[#152A38]", position: "bottom-0 right-0" },
  ]

  return (
    <Panel title="Cards · phased rollout">
      <p className="mb-3 text-sm font-semibold">Personal and business spending</p>
      <div className="relative mx-auto min-h-[15rem] w-full max-w-[25rem] flex-1">
        {cards.map((card) => (
          <div key={card.label} className={`absolute flex aspect-[1.586] w-[80%] flex-col justify-between overflow-hidden rounded-xl p-4 text-white shadow-[0_10px_24px_rgba(15,17,16,0.15)] ${card.color} ${card.position}`}>
            <div aria-hidden="true" className="absolute -right-10 -top-10 size-40 rounded-full border-[20px] border-white/5" />
            <div className="relative flex justify-between text-[11px]">
              <span className="font-semibold">Easner</span>
              <span>{card.label}</span>
            </div>
            <div className="relative mt-3 flex items-end justify-between">
              <div>
                <p className="font-mono text-sm tracking-wider">•••• {card.ending}</p>
                <p className="mt-1 text-[10px]">Amara Okafor</p>
              </div>
              <CreditCard className="size-5" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[#63717B]">Preview · subject to availability and approval</p>
    </Panel>
  )
}

export function IssueCardPreview() {
  return <Panel title="New card · preview"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Cardholder details</p><span className="rounded-full bg-[#F0F8FE] px-2 py-1 text-[10px] text-[#0064A8]">Virtual card</span></div><div className="my-3 rounded-xl border border-[#E3E8EB] bg-[#FAFBFC] px-3 py-1"><Row label="Cardholder" value="Amara Okafor" /><Row label="Monthly limit" value="$2,500" /><Row label="Spending policy" value="Software vendors" /></div><div className="mt-auto flex items-center justify-between gap-2 text-[10px]"><span className="text-[#63717B]">When enabled for your account</span><span className="rounded-full bg-[#007ACC] px-3 py-2 font-semibold text-white">Review card</span></div></Panel>
}

export function IntegrationWorkflowPreview() {
  return <Panel title="Developer workflow"><p className="text-base font-semibold">From onboarding to payment</p><p className="mt-1 text-[11px] leading-5 text-[#63717B]">Connect the steps your product needs.</p><div className="mt-3 space-y-2">{[{ title: "Verify your customer", detail: "Identity or business verification" }, { title: "Receive funds", detail: "Account details and supported deposits" }, { title: "Send a payment", detail: "Review the quote and create a payout" }, { title: "Follow the result", detail: "Payment status and signed webhooks" }].map((step, index) => <div key={step.title} className="flex items-center gap-3 rounded-xl border border-[#E3E8EB] p-2.5"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EAF5FD] text-[10px] font-semibold text-[#0064A8]">{index + 1}</span><div><p className="text-[11px] font-semibold">{step.title}</p><p className="mt-0.5 text-[10px] text-[#63717B]">{step.detail}</p></div></div>)}</div><p className="mt-auto pt-3 text-[10px] text-[#63717B]">API reference and sandbox access during onboarding</p></Panel>
}
