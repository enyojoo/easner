/** Invoicing page screens (design system: BizInvoiceCreate, BizInvoicePublic, BizInvoiceCustomers). */
import { ArrowLeft, Coins, CreditCard, Landmark } from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { StatusBadge, type StatusKey } from "@/components/ds/status-badge"
import { DEMO_MERCHANTS } from "@/lib/marketing/demo-data"
import { formatMoney } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import { at, panel, type Canvas } from "../canvas"
import { BankTransferDetails, InvoiceDocument, PayPanel, Segmented, UsdcDeposit } from "../pay-parts"
import { Avatar, PButton, PCard, PField, surface, TableHead, TableRow } from "../web-parts"

const northwind = DEMO_MERCHANTS.northwind
const money = (value: number) => formatMoney(value, "USD", { cents: "always" })

const METHODS = [
  { label: "Card", Icon: CreditCard },
  { label: "Bank transfer", Icon: Landmark },
  { label: "USDC", Icon: Coins },
]

/** "Left to pay" panel beside the invoice, on the chosen method. */
function LeftToPay({ method }: { method: 0 | 1 | 2 }) {
  return (
    <PCard className="h-full">
      <div className="text-sm text-muted-foreground">Left to pay</div>
      <div className="text-[38px] font-bold leading-[46px] tracking-[-0.02em]">
        <Amount value={4180} cents="always" minor="display" />
      </div>
      <div className="text-[13px] text-muted-foreground">Due Oct 31 · in 21 days · $5,280.00 of $9,460.00 paid</div>
      <div className="mt-4">
        <Segmented options={METHODS} active={method} />
      </div>
      <div className="mt-4">
        {method === 0 && <PayPanel merchant={northwind} amount={4180} email={null} usdc={false} compact />}
        {method === 1 && <BankTransferDetails reference="NW-0142" amount={4180} name="Northwind Trading Ltd" />}
        {method === 2 && <UsdcDeposit amount={4180} />}
      </div>
    </PCard>
  )
}

function NewInvoiceCard() {
  return (
    <PCard className="h-full">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full border border-border">
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="text-xl font-semibold">New invoice</span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Draft</span>
      </div>
      <div className="flex items-center gap-3 rounded-[16px] border border-input px-4 py-3">
        <Avatar initials="AL" className="size-9 text-xs" />
        <span className="flex-1 text-sm">
          <span className="block font-medium">Acme Logistics</span>
          <span className="block text-xs text-muted-foreground">ap@acme.com · Net 30 · USD</span>
        </span>
        <span className="text-sm font-medium">Change</span>
      </div>
      <div className="mt-4 grid gap-2.5">
        <PField>Freight forwarding, Lagos to Accra</PField>
        <div className="grid grid-cols-[90px_1fr_1fr_auto] items-center gap-2.5">
          <PField className="justify-between">6</PField>
          <PField>$1,850.00</PField>
          <PField select>VAT 7.5%</PField>
          <span className="w-28 text-right text-[15px] font-semibold">{money(11100)}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="flex gap-1.5">
          {["On receipt", "Net 15", "Net 30"].map((term) => (
            <span
              key={term}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                term === "Net 30" ? "border-foreground bg-foreground text-background" : "border-input",
              )}
            >
              {term}
            </span>
          ))}
        </span>
        <PButton>Review and send</PButton>
      </div>
    </PCard>
  )
}

function CustomersTable() {
  const template = "1.5fr 1fr 1fr 0.9fr"
  const rows: [string, string, string, number, StatusKey][] = [
    ["AL", "Acme Logistics", "Accra, Ghana", 4180, "unpaid"],
    ["MS", "Meridian Supplies", "Lagos, Nigeria", 0, "paid"],
    ["NS", "Northstar Studio", "Austin, US", 2400, "overdue"],
    ["KC", "Kilimanjaro Coffee", "Nairobi, Kenya", 860, "unpaid"],
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Customers</span>
        <span className="text-sm text-muted-foreground">24 customers</span>
      </div>
      <TableHead columns={["Customer", "Location", "Outstanding", "Status"]} template={template} />
      {rows.map(([initials, name, place, owed, status], index) => (
        <TableRow
          key={name}
          divider={index > 0}
          template={template}
          cells={[
            <span key="c" className="flex items-center gap-2.5">
              <Avatar initials={initials} className="size-8 text-xs" />
              <span className="font-medium">{name}</span>
            </span>,
            <span key="l" className="text-muted-foreground">
              {place}
            </span>,
            <span key="o" className="font-semibold">
              {money(owed)}
            </span>,
            <span key="s" className="flex justify-end">
              <StatusBadge status={status} />
            </span>,
          ]}
        />
      ))}
    </PCard>
  )
}

export const INVOICING_SLOTS: Record<string, Canvas> = {
  "mkt-hero-invoicing-01": {
    width: 1000,
    height: 600,
    render: () =>
      surface(
        <>
          {at(30, 30, <InvoiceDocument className="w-[660px]" />, 1)}
          {at(
            580,
            170,
            <div className="w-[390px]">
              <LeftToPay method={0} />
            </div>,
            2,
          )}
        </>,
      ),
    mobile: panel(440, 560, surface(<LeftToPay method={0} />)),
  },
  "mkt-ui-invoice-editor": panel(600, 380, surface(<NewInvoiceCard />)),
  "mkt-ui-invoice-online-payin": panel(440, 470, surface(<LeftToPay method={0} />)),
  "mkt-ui-invoice-bank-payin": panel(440, 460, surface(<LeftToPay method={1} />)),
  "mkt-ui-invoice-stablecoin-payin": panel(440, 520, surface(<LeftToPay method={2} />)),
  "mkt-ui-invoice-customers": panel(640, 340, surface(<CustomersTable />)),
}
