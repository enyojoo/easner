/**
 * Hosted pay surfaces shared by Checkout, Payment Links and Invoicing (design system: CheckoutHosted,
 * CheckoutPay, BizPayPublic, BizInvoicePublic). The merchant's accent colour is data, applied per page.
 */
import type { ReactNode } from "react"
import { Building2, Coins, Copy, CreditCard, Landmark, Lock } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Amount } from "@/components/ds/amount"
import type { DemoMerchant } from "@/lib/marketing/demo-data"
import { formatMoney } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import { PCard } from "./web-parts"

export function MerchantTile({ merchant, size = 32 }: { merchant: DemoMerchant; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[10px] font-semibold text-white"
      style={{ width: size, height: size, background: merchant.color, fontSize: size * 0.45 }}
    >
      {merchant.initial}
    </span>
  )
}

export function MerchantHeader({ merchant }: { merchant: DemoMerchant }) {
  return (
    <div className="flex items-center gap-3 text-base font-semibold">
      <MerchantTile merchant={merchant} />
      {merchant.name}
    </div>
  )
}

function Input({ children, placeholder, className }: { children?: ReactNode; placeholder?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2.5 rounded-[16px] border border-input bg-card px-4 text-[15px]",
        placeholder && "text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Segmented({ options, active }: { options: { label: string; Icon: typeof CreditCard }[]; active: number }) {
  return (
    <div className="flex rounded-[16px] bg-muted p-1">
      {options.map(({ label, Icon }, index) => (
        <span
          key={label}
          className={cn(
            "flex h-9 flex-1 items-center justify-center gap-2 rounded-[12px] text-sm font-medium",
            index === active ? "bg-card shadow-soft" : "text-muted-foreground",
          )}
        >
          <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}

/** The pay panel: wallet button, Card or bank / USDC, the card form and the merchant-coloured Pay button. */
export function PayPanel({
  merchant,
  amount,
  payLabel,
  usdc = true,
  wallet = "Apple Pay",
  email = "kwame@acme.com",
  compact,
}: {
  merchant: DemoMerchant
  amount: number
  payLabel?: string
  usdc?: boolean
  wallet?: "Apple Pay" | "Google Pay"
  email?: string | null
  compact?: boolean
}) {
  return (
    <div className="grid gap-3">
      {email !== null && (
        <div>
          <div className="mb-1.5 text-sm font-medium">Email</div>
          <Input>{email}</Input>
        </div>
      )}
      <div className="grid h-12 place-items-center rounded-[16px] bg-foreground text-[15px] font-semibold text-background">
        {wallet}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or pay another way
        <span className="h-px flex-1 bg-border" />
      </div>
      {usdc && (
        <Segmented
          active={0}
          options={[
            { label: "Card or bank", Icon: CreditCard },
            { label: "USDC", Icon: Coins },
          ]}
        />
      )}
      <div className="grid grid-cols-2 gap-2.5">
        <span
          className="grid h-[60px] content-center gap-1 rounded-[16px] border-2 px-3.5 text-sm font-medium"
          style={{ borderColor: merchant.color }}
        >
          <CreditCard className="size-4" strokeWidth={2} aria-hidden="true" />
          Card
        </span>
        <span className="grid h-[60px] content-center gap-1 rounded-[16px] border border-input px-3.5 text-sm text-muted-foreground">
          <Landmark className="size-4" strokeWidth={2} aria-hidden="true" />
          US bank account
        </span>
      </div>
      {!compact && (
        <>
          <Input placeholder>
            <CreditCard className="size-4" strokeWidth={2} aria-hidden="true" />
            <span className="flex-1">Card number</span>
            <span className="rounded bg-brand-navy px-1.5 py-0.5 text-[10px] font-bold text-white">VISA</span>
            <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">MC</span>
          </Input>
          <div className="grid grid-cols-2 gap-2.5">
            <Input placeholder>MM / YY</Input>
            <Input placeholder>CVC</Input>
          </div>
        </>
      )}
      <div
        className="grid h-12 place-items-center rounded-[16px] text-[15px] font-semibold text-white"
        style={{ background: merchant.color }}
      >
        {payLabel ?? `Pay ${formatMoney(amount, "USD", { cents: "always" })}`}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3" strokeWidth={2} aria-hidden="true" />
        Payments are encrypted.
      </div>
    </div>
  )
}

export interface OrderLine {
  name: string
  detail?: string
  amount: number
  qty?: number
}

/** The order on the merchant's tint: heading amount, lines, totals. */
export function OrderSummary({
  merchant,
  title,
  amount,
  subtitle,
  lines,
  totals,
  headline,
}: {
  merchant: DemoMerchant
  title?: string
  amount: number
  subtitle?: string
  lines: OrderLine[]
  totals: [string, ReactNode][]
  headline?: ReactNode
}) {
  return (
    <div className="h-full px-10 py-12" style={{ background: merchant.tint }}>
      <div className="text-sm text-muted-foreground">{title ?? `Pay ${merchant.name}`}</div>
      <div className="mt-1 text-[40px] font-bold leading-[48px] tracking-[-0.02em]">
        {headline ?? <Amount value={amount} cents="always" minor="display" />}
      </div>
      {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
      <div className="mt-6 grid gap-4">
        {lines.map((line) => (
          <div key={line.name} className="flex items-start gap-3.5">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-[12px] text-base font-semibold text-white"
              style={{ background: merchant.color, opacity: 0.85 }}
            >
              {line.name[0]}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-medium">{line.name}</span>
              {line.detail && <span className="block text-muted-foreground">{line.detail}</span>}
              {line.qty && (
                <span className="mt-1 inline-block rounded-[8px] border border-input px-2 py-0.5 text-xs">Qty {line.qty}</span>
              )}
            </span>
            <span className="text-sm font-medium">{formatMoney(line.amount, "USD", { cents: "always" })}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-border">
        {totals.map(([label, value], index) => (
          <div
            key={label}
            className={cn(
              "flex items-center justify-between py-2.5 text-sm",
              index === totals.length - 1 && "border-t border-border font-semibold",
            )}
          >
            <span className={index === totals.length - 1 ? undefined : "text-muted-foreground"}>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** USDC deposit: QR, the exact amount and network, the wallet address and the waiting state. */
export function UsdcDeposit({
  amount,
  address = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
}: {
  amount: number
  address?: string
}) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-4 rounded-[16px] border border-border/70 p-3">
        <span className="rounded-[12px] bg-white p-2 shadow-[inset_0_0_0_1px_var(--border)]">
          <QRCodeSVG value={`solana:${address}`} size={104} level="M" />
        </span>
        <span>
          <span className="block text-[13px] text-muted-foreground">Send exactly</span>
          <span className="block text-2xl font-bold tracking-[-0.01em]">
            {amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
          </span>
          <span className="block text-[13px] text-muted-foreground">
            On Solana · held for <span className="font-mono font-medium text-foreground">14:32</span>
          </span>
        </span>
      </div>
      <div>
        <div className="mb-1.5 text-sm font-medium">Wallet address</div>
        <div className="flex items-center justify-between gap-3 rounded-[16px] bg-muted/70 px-3.5 py-3 font-mono text-[13px] leading-5">
          <span className="break-all">{address}</span>
          <Copy className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-[16px] bg-muted/70 px-3.5 py-3 text-[13px]">
        <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        Waiting for your payment… This page updates by itself.
      </div>
    </div>
  )
}

/** Bank transfer: the reference leads, then the account details (BizInvoicePublic). */
export function BankTransferDetails({ reference, amount, name }: { reference: string; amount: number; name: string }) {
  return (
    <div className="grid gap-1">
      <div className="mb-2 flex items-center justify-between rounded-[16px] border-2 border-primary bg-surface-tint px-4 py-3">
        <span>
          <span className="block text-xs font-medium text-primary-text">Use this reference</span>
          <span className="block font-mono text-lg font-semibold">{reference}</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Copy className="size-4" strokeWidth={2} aria-hidden="true" />
          Copy
        </span>
      </div>
      {[
        ["Account name", name],
        [
          "Account number",
          <span key="n" className="font-mono">
            •••• 9934
          </span>,
        ],
        [
          "Routing (ACH)",
          <span key="r" className="font-mono">
            •••• 9644
          </span>,
        ],
        [
          "Amount",
          <span key="a" className="font-semibold">
            {formatMoney(amount, "USD", { cents: "always" })}
          </span>,
        ],
      ].map(([label, value], index) => (
        <div
          key={index}
          className={cn("flex h-11 items-center justify-between text-sm", index > 0 && "border-t border-border/60")}
        >
          <span className="text-muted-foreground">{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

/** The invoice document (InvoicePublic left column / PdfInvoices). */
export function InvoiceDocument({ className }: { className?: string }) {
  const lines = [
    {
      name: "Freight forwarding, Lagos to Accra",
      detail: "40ft container · Oct 2–9",
      qty: 4,
      price: 1850,
      tax: "7.5%",
      amount: 7400,
    },
    { name: "Customs clearance", detail: "Tema port", qty: 1, price: 1400, tax: "7.5%", amount: 1400 },
  ]
  return (
    <PCard className={cn("p-8", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-[12px] bg-muted text-sm font-medium">
            <Building2 className="size-5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-semibold">Northwind Trading Ltd</span>
            <span className="block text-xs text-muted-foreground">14 Ring Road, Accra · TIN C0012345678</span>
          </span>
        </div>
        <span className="text-right">
          <span className="block text-2xl font-semibold">Invoice</span>
          <span className="block font-mono text-sm text-muted-foreground">INV-0142</span>
        </span>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-4 text-sm">
        {[
          ["Bill to", "Acme Logistics"],
          ["Issued", "Oct 1, 2026"],
          ["Due", "Oct 31, 2026"],
          ["PO", "PO-7781"],
        ].map(([label, value]) => (
          <span key={label}>
            <span className="block text-xs text-muted-foreground">{label}</span>
            <span className="block font-medium">{value}</span>
          </span>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-[1fr_44px_96px_56px_100px] border-b border-border/60 pb-2 text-xs text-muted-foreground">
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Price</span>
        <span className="text-right">Tax</span>
        <span className="text-right">Amount</span>
      </div>
      {lines.map((line) => (
        <div
          key={line.name}
          className="grid grid-cols-[1fr_44px_96px_56px_100px] items-start border-b border-border/60 py-3 text-sm"
        >
          <span>
            <span className="block">{line.name}</span>
            <span className="block text-xs text-muted-foreground">{line.detail}</span>
          </span>
          <span className="text-right">{line.qty}</span>
          <span className="text-right">{formatMoney(line.price, "USD", { cents: "always" })}</span>
          <span className="text-right">{line.tax}</span>
          <span className="text-right">{formatMoney(line.amount, "USD", { cents: "always" })}</span>
        </div>
      ))}
      <div className="ml-auto mt-3 w-[300px] text-sm">
        {[
          ["Subtotal", formatMoney(8800, "USD", { cents: "always" })],
          ["VAT 7.5%", formatMoney(660, "USD", { cents: "always" })],
          ["Total", formatMoney(9460, "USD", { cents: "always" })],
        ].map(([label, value], index) => (
          <div key={label} className={cn("flex justify-between py-2", index === 2 && "border-t border-border/60 font-semibold")}>
            <span className={index === 2 ? undefined : "text-muted-foreground"}>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </PCard>
  )
}
