import Image from "next/image"
import type { ReactNode } from "react"
import {
  ArrowRightLeft,
  Banknote,
  CheckCircle2,
  Code2,
  CreditCard,
  FileText,
  Globe2,
  Landmark,
  LockKeyhole,
  QrCode,
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  SquareTerminal,
  UserRoundPlus,
  Users2,
  WalletCards,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAssetObjectPosition, getAssetUrl, getVisualKind, isPlaceholderOnly } from "@/lib/marketing/assets"
import { CorridorCoverageVisual } from "./corridor-coverage-visual"

interface VisualSlotProps {
  assetId: string
  alt: string
  className?: string
  aspect?: "hero" | "feature" | "square" | "fill"
}

const iconByAsset = {
  "mkt-icon-pillar-ux": Smartphone,
  "mkt-icon-pillar-cost": Banknote,
  "mkt-icon-pillar-compliance": ShieldCheck,
  "mkt-icon-pillar-invisible": ArrowRightLeft,
  "mkt-thumb-personal": Smartphone,
  "mkt-thumb-business": Landmark,
  "mkt-thumb-apis": Code2,
  "mkt-thumb-stablecoin": ArrowRightLeft,
  "mkt-thumb-invoicing": ReceiptText,
  "mkt-thumb-cards": CreditCard,
  "mkt-icon-api-banking": Landmark,
  "mkt-icon-api-agency": Users2,
  "mkt-icon-api-integration": Code2,
  "mkt-icon-security": LockKeyhole,
} as const

export function VisualSlot({ assetId, alt, className, aspect = "feature" }: VisualSlotProps) {
  const url = getAssetUrl(assetId)
  const showMockup = isPlaceholderOnly(assetId)
  const kind = getVisualKind(assetId)
  const objectPosition = getAssetObjectPosition(assetId)

  const aspectClass =
    aspect === "fill"
      ? "h-full min-h-[16rem] w-full sm:min-h-[18rem]"
      : aspect === "hero"
      ? "aspect-[16/10] md:aspect-[16/9]"
      : aspect === "square"
        ? "aspect-square"
        : kind === "map"
          ? "aspect-[4/5] sm:aspect-[4/3]"
          : kind === "persona"
            ? "aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5]"
          : "aspect-[4/3]"

  if (!showMockup && url) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.75rem] border border-[#E4DED1] bg-[#F0EDE4] shadow-[0_24px_80px_rgba(15,17,16,0.12)]",
          aspectClass,
          className
        )}
      >
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover"
          style={objectPosition ? { objectPosition } : undefined}
          sizes="(min-width: 1024px) 50vw, 100vw"
          unoptimized
        />
      </div>
    )
  }

  const compact = aspect === "square"

  if (kind === "phone") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <PhoneMockup assetId={assetId} compact={compact} />
      </MockupFrame>
    )
  }

  if (kind === "dashboard") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <DashboardMockup assetId={assetId} compact={compact} />
      </MockupFrame>
    )
  }

  if (kind === "invoice") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <InvoiceMockup compact={compact} />
      </MockupFrame>
    )
  }

  if (kind === "api") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <ApiMockup compact={compact} />
      </MockupFrame>
    )
  }

  if (kind === "card") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <CardMockup assetId={assetId} compact={compact} />
      </MockupFrame>
    )
  }

  if (kind === "map") {
    return <CorridorCoverageVisual className={cn(aspectClass, className)} />
  }

  if (kind === "terminal") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <TerminalMockup compact={compact} />
      </MockupFrame>
    )
  }

  if (kind === "qr") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <QrPayMockup compact={compact} />
      </MockupFrame>
    )
  }

  if (kind === "compliance") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <ComplianceMockup compact={compact} />
      </MockupFrame>
    )
  }

  if (kind === "persona") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className}>
        <PersonaMockup assetId={assetId} compact={compact} />
      </MockupFrame>
    )
  }

  const Icon = iconByAsset[assetId as keyof typeof iconByAsset] ?? ShieldCheck

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-[#E4DED1] bg-white text-[#007ACC] shadow-sm",
        aspectClass,
        className
      )}
      aria-label={alt}
    >
      <Icon className="h-8 w-8" />
    </div>
  )
}

function MockupFrame({
  alt,
  aspectClass,
  className,
  children,
}: {
  alt: string
  aspectClass: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[1.75rem] border border-[#E4DED1] bg-[#F8F6F0] shadow-[0_24px_80px_rgba(15,17,16,0.12)]",
        aspectClass,
        className
      )}
      aria-label={alt}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,122,204,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.95),rgba(246,243,235,0.75))]" />
      <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-[#007ACC]/25 to-transparent" />
      <div className="relative h-full w-full p-5 sm:p-7">{children}</div>
    </div>
  )
}

function PhoneMockup({ assetId, compact }: { assetId: string; compact: boolean }) {
  const isSend = assetId.includes("send")
  const isRecipients = assetId.includes("recipients")

  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-[82%] max-h-[31rem] w-[min(56%,17rem)] min-w-[10rem] rounded-[2.3rem] border-[9px] border-[#0F1110] bg-[#0F1110] shadow-2xl">
        <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/15" />
        <div className="h-full overflow-hidden rounded-[1.7rem] bg-[#F6F3EB] p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">
                Easner Personal
              </div>
              <div className="mt-1 text-xl font-semibold text-[#0F1110]">$8,420.18</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007ACC] text-white">
              <Smartphone className="h-4 w-4" />
            </div>
          </div>
          <div className="rounded-2xl bg-[#0F1110] p-4 text-white">
            <div className="text-xs text-white/60">{isSend ? "Send quote" : "Available"}</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-semibold">{isSend ? "$250" : "USD"}</div>
              <div className="rounded-full bg-white/12 px-2 py-1 text-[10px]">where enabled</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MiniAction icon={isRecipients ? UserRoundPlus : Send} label={isRecipients ? "Tag" : "Send"} />
            <MiniAction icon={isSend ? Globe2 : Banknote} label={isSend ? "Global" : "Receive"} />
          </div>
          <div className="mt-4 space-y-2">
            {(isRecipients ? ["Amara O.", "Nuel K.", "Maya R."] : ["Bank transfer", "Stablecoin receive", "NGN payout"]).map(
              (item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <div className="h-8 w-8 rounded-full bg-[#EAF5FD]" />
                  <div className="min-w-0 flex-1">
                    <div className="h-2.5 w-24 rounded-full bg-[#0F1110]/80" />
                    <div className="mt-1.5 h-2 w-16 rounded-full bg-[#D9D4C7]" />
                  </div>
                  <div className={cn("h-2.5 w-10 rounded-full", index === 0 ? "bg-[#0F8A5F]" : "bg-[#D9D4C7]")} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="-ml-10 hidden w-48 rounded-3xl border border-[#E4DED1] bg-white p-4 shadow-xl sm:block">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Receive</div>
          <div className="mt-3 rounded-2xl bg-[#EAF5FD] p-3 text-sm font-semibold text-[#0A2540]">
            Bank or stablecoin
          </div>
          <div className="mt-3 space-y-2">
            <Line width="w-28" />
            <Line width="w-20" muted />
            <Line width="w-24" muted />
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardMockup({ assetId, compact }: { assetId: string; compact: boolean }) {
  const isAccounts = assetId.includes("accounts")
  const isSend = assetId.includes("send")

  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-[88%] w-[94%] overflow-hidden rounded-2xl border border-[#D9D4C7] bg-white shadow-xl">
        <div className="flex h-10 items-center gap-2 border-b border-[#E9E4D8] bg-[#0F1110] px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F6F3EB]/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F6F3EB]/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F6F3EB]/20" />
          <div className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/70">
            Easner Business
          </div>
        </div>
        <div className="grid h-[calc(100%-2.5rem)] grid-cols-[0.34fr_1fr]">
          <div className="hidden border-r border-[#E9E4D8] bg-[#F8F6F0] p-4 sm:block">
            <div className="mb-6 h-7 w-24 rounded-full bg-[#0F1110]" />
            {["Accounts", "Payouts", "Invoices", "Team"].map((item, index) => (
              <div key={item} className={cn("mb-2 rounded-xl px-3 py-2 text-xs", index === 0 ? "bg-[#EAF5FD] text-[#007ACC]" : "text-[#6F756F]")}>
                {item}
              </div>
            ))}
          </div>
          <div className="p-4 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">
                  {isSend ? "Payout review" : isAccounts ? "Multi-currency accounts" : "Global money movement"}
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#0F1110]">$184,920.40</div>
              </div>
              <div className="rounded-full bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">Get Started</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["USD", "EUR", "NGN"].map((currency, index) => (
                <div key={currency} className="rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
                  <div className="text-xs text-[#6F756F]">{currency}</div>
                  <div className="mt-2 h-3 w-16 rounded-full bg-[#0F1110]" />
                  <div className={cn("mt-4 h-1.5 rounded-full", index === 0 ? "bg-[#007ACC]" : "bg-[#D9D4C7]")} />
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.75fr]">
              <div className="rounded-2xl border border-[#E9E4D8] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0F1110]">{isSend ? "Approved payout path" : "Recent activity"}</div>
                  <ArrowRightLeft className="h-4 w-4 text-[#007ACC]" />
                </div>
                {["Verification complete", "Quote reserved", "Ready to settle"].map((item, index) => (
                  <div key={item} className="mb-3 flex items-center gap-3 last:mb-0">
                    <CheckCircle2 className={cn("h-4 w-4", index === 2 ? "text-[#007ACC]" : "text-[#0F8A5F]")} />
                    <div className="flex-1">
                      <Line width={index === 1 ? "w-32" : "w-40"} />
                      <Line width="w-20" muted className="mt-1.5" />
                    </div>
                  </div>
                ))}
              </div>
              {!compact && (
                <div className="rounded-2xl bg-[#0A2540] p-4 text-white">
                  <div className="text-xs text-white/60">Where enabled</div>
                  <div className="mt-2 text-lg font-semibold">Bank + stablecoin rails</div>
                  <div className="mt-5 space-y-2">
                    <Line width="w-28" light />
                    <Line width="w-20" light muted />
                    <Line width="w-24" light muted />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoiceMockup({ compact }: { compact: boolean }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid h-[88%] w-[92%] gap-4 md:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-[#E4DED1] bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <ReceiptText className="h-7 w-7 text-[#007ACC]" />
            <div className="rounded-full bg-[#EAF5FD] px-3 py-1 text-xs font-semibold text-[#0A2540]">Draft invoice</div>
          </div>
          <div className="mt-7 text-2xl font-semibold text-[#0F1110]">$4,800.00</div>
          <div className="mt-5 space-y-3">
            <Line width="w-full" />
            <Line width="w-3/4" muted />
            <Line width="w-5/6" muted />
          </div>
          <div className="mt-7 rounded-2xl bg-[#F8F6F0] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Payment options</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniAction icon={Landmark} label="Bank" />
              <MiniAction icon={WalletCards} label="Stablecoin" />
            </div>
          </div>
        </div>
        {!compact && (
          <div className="hidden rounded-3xl bg-[#0F1110] p-5 text-white shadow-xl md:block">
            <FileText className="h-7 w-7 text-white/80" />
            <div className="mt-8 text-xl font-semibold">Payment link ready</div>
            <div className="mt-4 space-y-3">
              <Line width="w-36" light />
              <Line width="w-28" light muted />
              <Line width="w-32" light muted />
            </div>
            <div className="mt-8 rounded-2xl bg-white/10 p-4">
              <div className="h-14 rounded-xl bg-white/15" />
              <div className="mt-3 h-2 rounded-full bg-white/25" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ApiMockup({ compact }: { compact: boolean }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-[88%] w-[92%] overflow-hidden rounded-3xl border border-[#D9D4C7] bg-[#0F1110] shadow-xl">
        <div className="flex h-10 items-center gap-2 border-b border-white/10 px-4">
          <Code2 className="h-4 w-4 text-[#3AA6F8]" />
          <span className="text-xs font-medium text-white/60">api.easner.com</span>
        </div>
        <div className="grid h-[calc(100%-2.5rem)] gap-4 p-5 md:grid-cols-[1fr_0.8fr]">
          <div className="font-mono text-xs leading-6 text-white/80">
            <div><span className="text-[#3AA6F8]">POST</span> /v1/accounts</div>
            <div className="mt-4 text-white/40">{"{"}</div>
            <div className="pl-4"><span className="text-[#7DD3FC]">"type"</span>: "business",</div>
            <div className="pl-4"><span className="text-[#7DD3FC]">"currency"</span>: "USD",</div>
            <div className="pl-4"><span className="text-[#7DD3FC]">"compliance"</span>: "required"</div>
            <div className="text-white/40">{"}"}</div>
            <div className="mt-5 rounded-xl bg-white/8 p-3 text-white/60">
              verification.status: approved
            </div>
          </div>
          {!compact && (
            <div className="hidden rounded-2xl bg-white p-4 text-[#0F1110] md:block">
              <div className="text-sm font-semibold">Embedded rails</div>
              {["KYC/KYB", "Accounts", "Payouts", "Collections"].map((item) => (
                <div key={item} className="mt-3 flex items-center gap-3 rounded-xl bg-[#F8F6F0] p-3">
                  <CheckCircle2 className="h-4 w-4 text-[#0F8A5F]" />
                  <span className="text-xs font-medium">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CardMockup({ assetId, compact }: { assetId: string; compact: boolean }) {
  if (assetId.includes("issue")) {
    return <CardIssueMockup compact={compact} />
  }
  if (assetId.includes("cardholders")) {
    return <CardholdersMockup compact={compact} />
  }
  if (assetId.includes("reporting")) {
    return <CardReportingMockup compact={compact} />
  }
  return <CardControlsMockup compact={compact} />
}

function CardIssueMockup({ compact }: { compact: boolean }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid h-[86%] w-[92%] gap-4 md:grid-cols-2">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#007ACC] to-[#0A2540] p-5 text-white shadow-xl">
          <div className="text-xs uppercase tracking-[0.18em] text-white/50">Virtual card</div>
          <div className="mt-12 text-lg font-semibold">Instant issue</div>
          <div className="mt-8 flex items-center justify-between text-sm text-white/70">
            <span>•••• 9041</span>
            <WalletCards className="h-7 w-7" />
          </div>
          <div className="mt-6 rounded-full bg-white/15 px-3 py-1 text-xs text-white/80 w-fit">Ready to use</div>
        </div>
        {!compact && (
          <div className="hidden rounded-3xl border border-[#E4DED1] bg-[#0F1110] p-5 text-white shadow-xl md:block">
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">Physical card</div>
            <div className="mt-12 text-lg font-semibold">Global spend</div>
            <div className="mt-8 flex items-center justify-between text-sm text-white/60">
              <span>•••• 4829</span>
              <CreditCard className="h-7 w-7" />
            </div>
            <div className="mt-6 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 w-fit">Shipped · Active</div>
          </div>
        )}
      </div>
    </div>
  )
}

function CardControlsMockup({ compact }: { compact: boolean }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid h-[86%] w-[92%] gap-4 md:grid-cols-[0.9fr_1fr]">
        <div className="relative rounded-3xl bg-[#0F1110] p-5 text-white shadow-xl">
          <div className="text-xs uppercase tracking-[0.18em] text-white/50">Easner</div>
          <div className="mt-16 text-lg font-semibold">Global spend</div>
          <div className="mt-10 flex items-center justify-between text-sm text-white/60">
            <span>•••• 4829</span>
            <CreditCard className="h-7 w-7" />
          </div>
        </div>
        {!compact && (
          <div className="hidden rounded-3xl border border-[#E4DED1] bg-white p-5 shadow-xl md:block">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#0F1110]">Spend controls</div>
              <div className="rounded-full bg-[#EAF5FD] px-3 py-1 text-xs text-[#0A2540]">3 policies</div>
            </div>
            {["Monthly limit", "Travel policy", "Software vendors"].map((item, index) => (
              <div key={item} className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-[#6F756F]">
                  <span>{item}</span>
                  <span>{index === 0 ? "$2,500" : "On"}</span>
                </div>
                <div className="h-2 rounded-full bg-[#E9E4D8]">
                  <div className={cn("h-full rounded-full bg-[#007ACC]", index === 0 ? "w-2/3" : "w-4/5")} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CardholdersMockup({ compact }: { compact: boolean }) {
  const cardholders = [
    { name: "Amara O.", card: "•••• 4829", status: "Active", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { name: "James K.", card: "•••• 9041", status: "Active", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { name: "Ops team", card: "•••• 1182", status: "Frozen", tone: "text-[#6F756F] bg-[#F0EDE4]" },
  ]

  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-[88%] w-[92%] rounded-3xl border border-[#E4DED1] bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Cardholders</div>
            <div className="mt-2 text-xl font-semibold text-[#0F1110]">Team cards</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF5FD] text-[#007ACC]">
            <UserRoundPlus className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {cardholders.map((holder) => (
            <div key={holder.name} className="flex items-center justify-between rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F1110] text-sm font-semibold text-white">
                  {holder.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0F1110]">{holder.name}</div>
                  <div className="text-xs text-[#6F756F]">{holder.card}</div>
                </div>
              </div>
              <div className={cn("rounded-full px-3 py-1 text-xs font-semibold", holder.tone)}>{holder.status}</div>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-5 rounded-2xl border border-dashed border-[#D9D4C7] bg-[#F8F6F0] p-4 text-center text-sm text-[#6F756F]">
            Add cardholder
          </div>
        )}
      </div>
    </div>
  )
}

function CardReportingMockup({ compact }: { compact: boolean }) {
  const activity = [
    { label: "Card · Software subscription", amount: "-$129.00", type: "card" },
    { label: "Payout · Supplier wire", amount: "-$4,200.00", type: "payout" },
    { label: "Card · Travel booking", amount: "-$860.00", type: "card" },
    { label: "Collection · Invoice paid", amount: "+$4,800.00", type: "collection" },
  ]

  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid h-[88%] w-[92%] gap-4 md:grid-cols-[0.85fr_1fr]">
        <div className="rounded-3xl border border-[#E4DED1] bg-white p-5 shadow-xl">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">This month</div>
          <div className="mt-2 text-2xl font-semibold text-[#0F1110]">$12,480</div>
          <div className="mt-1 text-xs text-[#6F756F]">Card spend across teams</div>
          <div className="mt-6 flex items-end gap-2 h-24">
            {[42, 68, 55, 82, 48, 74].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-lg bg-[#007ACC]/80"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        {!compact && (
          <div className="hidden rounded-3xl border border-[#E4DED1] bg-[#F8F6F0] p-5 shadow-xl md:block">
            <div className="text-sm font-semibold text-[#0F1110]">Unified activity</div>
            <div className="mt-4 space-y-3">
              {activity.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF5FD] text-[#007ACC]">
                      {item.type === "card" ? (
                        <CreditCard className="h-4 w-4" />
                      ) : item.type === "payout" ? (
                        <Send className="h-4 w-4" />
                      ) : (
                        <ReceiptText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-xs text-[#0F1110]">{item.label}</div>
                  </div>
                  <div className={cn("text-xs font-semibold", item.amount.startsWith("+") ? "text-[#0F8A5F]" : "text-[#0F1110]")}>
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TerminalMockup({ compact }: { compact: boolean }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid h-[86%] w-[92%] gap-4 md:grid-cols-[0.8fr_1fr]">
        <div className="rounded-[2rem] bg-[#0F1110] p-5 text-white shadow-xl">
          <SquareTerminal className="h-8 w-8 text-[#3AA6F8]" />
          <div className="mt-8 text-3xl font-semibold">$128.00</div>
          <div className="mt-2 text-sm text-white/50">Ready to collect</div>
          <div className="mt-10 rounded-2xl bg-white/10 p-4 text-center text-sm">Tap, scan, or share</div>
        </div>
        {!compact && (
          <div className="hidden rounded-3xl border border-[#E4DED1] bg-white p-5 shadow-xl md:block">
            <div className="text-sm font-semibold text-[#0F1110]">Same dashboard reconciliation</div>
            {["Payment received", "Screening complete", "Ledger updated"].map((item) => (
              <div key={item} className="mt-4 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#0F8A5F]" />
                <span className="text-sm text-[#6F756F]">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QrPayMockup({ compact }: { compact: boolean }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[86%] w-[92%] items-center justify-center gap-5 rounded-3xl border border-[#E4DED1] bg-white p-6 shadow-xl">
        <div className="grid h-36 w-36 grid-cols-5 gap-1 rounded-2xl bg-[#0F1110] p-3">
          {Array.from({ length: 25 }).map((_, index) => (
            <span key={index} className={cn("rounded-sm", [0, 1, 5, 6, 18, 19, 23, 24, 12, 8, 16].includes(index) ? "bg-white" : "bg-white/20")} />
          ))}
        </div>
        {!compact && (
          <div className="hidden max-w-[14rem] sm:block">
            <QrCode className="h-8 w-8 text-[#007ACC]" />
            <div className="mt-4 text-2xl font-semibold text-[#0F1110]">QR Pay</div>
            <p className="mt-2 text-sm text-[#6F756F]">Scan-to-pay collections routed into Easner Business.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ComplianceMockup({ compact }: { compact: boolean }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-[90%] rounded-3xl border border-[#E4DED1] bg-white p-6 shadow-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5FD] text-[#007ACC]">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="mt-5 text-2xl font-semibold text-[#0F1110]">Compliance built in</div>
        {!compact && <p className="mt-2 text-sm text-[#6F756F]">Verification, screening, limits, and transaction controls live inside the account flow.</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {["KYC/KYB", "AML screening", "Tiered limits", "Audit trails"].map((item) => (
            <div key={item} className="rounded-2xl bg-[#F8F6F0] p-3 text-sm font-medium text-[#0F1110]">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PersonaMockup({ assetId, compact }: { assetId: string; compact: boolean }) {
  const label = assetId.includes("sme") ? "SME operator" : assetId.includes("dev") ? "Platform team" : "Global earner"

  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-[86%] w-[92%] overflow-hidden rounded-3xl border border-[#E4DED1] bg-white shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#F6F3EB,#FFFFFF_55%,#EAF5FD)]" />
        <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#0F1110]/10" />
        <div className="relative flex h-full flex-col justify-end p-6">
          <div className="w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#007ACC] shadow-sm">
            {label}
          </div>
          <div className="mt-3 max-w-sm text-2xl font-semibold text-[#0F1110]">
            Money movement for real work
          </div>
          {!compact && <p className="mt-2 max-w-sm text-sm text-[#6F756F]">A polished interim visual, ready to swap for brand photography.</p>}
        </div>
      </div>
    </div>
  )
}

function MiniAction({ icon: Icon, label }: { icon: typeof Send; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
      <Icon className="mx-auto h-4 w-4 text-[#007ACC]" />
      <div className="mt-1.5 text-[11px] font-semibold text-[#0F1110]">{label}</div>
    </div>
  )
}

function Line({
  width,
  muted,
  light,
  className,
}: {
  width: string
  muted?: boolean
  light?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "h-2 rounded-full",
        width,
        light ? (muted ? "bg-white/20" : "bg-white/45") : muted ? "bg-[#D9D4C7]" : "bg-[#0F1110]/75",
        className
      )}
    />
  )
}
