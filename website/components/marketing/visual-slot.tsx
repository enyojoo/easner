"use client"

import Image, { type StaticImageData } from "next/image"
import type { ReactNode } from "react"
import {
  ArrowRightLeft,
  Banknote,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Code2,
  Copy,
  CreditCard,
  Download,
  FileText,
  Globe2,
  HandHeart,
  Landmark,
  Link2,
  LockKeyhole,
  QrCode,
  ReceiptText,
  Repeat,
  Send,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  SquareTerminal,
  UserRoundPlus,
  Users2,
  Wallet,
  WalletCards,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAssetImageFit, getAssetObjectPosition, getAssetUrl, getVisualKind, isPlaceholderOnly } from "@/lib/marketing/assets"
import { HERO_VISUAL_HEIGHT, MOCKUP_CHROME_BAR, MOCKUP_DASHBOARD_GRID } from "@/lib/marketing/layout-constants"
import { CorridorCoverageVisual } from "./corridor-coverage-visual"
import { CurrencyBadge } from "./currency-badge"
import { BusinessDashboardMockup, HomeDashboardMockup } from "./account-mockups"
import { BusinessFeatureMockup, CustomerPaymentMockup, InvoiceDocumentMockup, PayrollRunMockup, InvoiceDetailsMockup, InvoiceCustomersPreview, StablecoinTransferPreview, CardsPreview, IssueCardPreview, IntegrationWorkflowPreview } from "./payment-mockups"

interface VisualSlotProps {
  assetId: string
  alt: string
  className?: string
  aspect?: "hero" | "feature" | "square" | "fill" | "card"
  priority?: boolean
  preload?: boolean
}

function isStaticImage(src: string | StaticImageData): src is StaticImageData {
  return typeof src !== "string"
}

const iconByAsset = {
  "mkt-icon-pillar-ux": Smartphone,
  "mkt-icon-pillar-cost": Banknote,
  "mkt-icon-pillar-compliance": ShieldCheck,
  "mkt-icon-pillar-invisible": ArrowRightLeft,
  "mkt-thumb-personal": Smartphone,
  "mkt-thumb-business": Landmark,
  "mkt-thumb-apis": Code2,
  "mkt-thumb-partners": Briefcase,
  "mkt-thumb-stablecoin": ArrowRightLeft,
  "mkt-thumb-invoicing": ReceiptText,
  "mkt-thumb-cards": CreditCard,
  "mkt-thumb-checkout": ShoppingCart,
  "mkt-thumb-paylinks": Link2,
  "mkt-thumb-payroll": Users2,
  "mkt-icon-api-banking": Landmark,
  "mkt-icon-api-agency": Users2,
  "mkt-icon-api-integration": Code2,
  "mkt-icon-security": LockKeyhole,
} as const

export function VisualSlot({
  assetId,
  alt,
  className,
  aspect = "feature",
  priority = false,
  preload = false,
}: VisualSlotProps) {
  const url = getAssetUrl(assetId)
  const showMockup = isPlaceholderOnly(assetId)
  const kind = getVisualKind(assetId)
  const objectPosition = getAssetObjectPosition(assetId)

  const isHero = aspect === "hero"
  const fill = aspect === "fill" || isHero
  const compact = aspect === "square" || aspect === "card"
  const dense = aspect === "card"
  const frameless = className?.includes("border-0")

  const aspectClass =
    aspect === "fill"
      ? "h-full w-full min-h-0"
      : aspect === "card"
        ? "h-full w-full min-h-0"
      : aspect === "hero"
        ? "h-full w-full min-h-0"
      : aspect === "square"
        ? "aspect-square"
        : kind === "map"
          ? "aspect-[4/5] sm:aspect-[4/3]"
          : "aspect-[4/3]"

  if (assetId === "mkt-hero-home-01") return <HomeDashboardMockup />

  if (!showMockup && url) {
    const imageFit = getAssetImageFit()
    const imageFitClass = imageFit === "cover" ? "object-cover" : "object-contain p-2 sm:p-3"
    const isPersonalHero = assetId === "mkt-hero-personal-01"

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.75rem] border border-[#E4DED1] bg-[#F0EDE4] shadow-[0_24px_80px_rgba(15,17,16,0.12)]",
          aspect === "fill" && HERO_VISUAL_HEIGHT,
          aspectClass,
          className
        )}
      >
        <Image
          src={url}
          alt={alt}
          fill
          className={cn(imageFitClass, isPersonalHero && "object-left md:object-center")}
          style={!isPersonalHero && objectPosition ? { objectPosition } : undefined}
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority={priority}
          loading={priority ? undefined : preload ? "eager" : "lazy"}
          placeholder={isStaticImage(url) ? "blur" : undefined}
        />
      </div>
    )
  }

  if (kind === "phone") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <PersonalMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "dashboard") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <BusinessDashboardMockup compact />
      </MockupFrame>
    )
  }

  if (kind === "business") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <BusinessMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "stablecoin") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <StablecoinMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "invoice") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <InvoiceMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "api") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <ApiMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "partners") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <PartnersMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "card") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <CardMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "checkout") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <CheckoutMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "payroll") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <PayrollMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "paylinks") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <PayLinksMockup assetId={assetId} compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "map") {
    if (aspect === "fill") {
      return (
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-[1.75rem] border border-[#E4DED1] bg-[#F8F6F0] shadow-[0_24px_80px_rgba(15,17,16,0.12)]",
            className
          )}
          aria-label={alt}
        >
          <CorridorCoverageVisual className="h-full rounded-none border-0 shadow-none" />
        </div>
      )
    }
    return <CorridorCoverageVisual className={cn(aspectClass, className)} aria-label={alt} />
  }

  if (kind === "terminal") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill}>
        <TerminalMockup compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "qr") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill}>
        <QrPayMockup compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "compliance") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill}>
        <ComplianceMockup compact={compact} fill={fill} />
      </MockupFrame>
    )
  }

  if (kind === "persona") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill}>
        <PersonaMockup assetId={assetId} compact={compact} fill={fill} />
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
  dense = false,
  fill = false,
  hero = false,
  frameless = false,
}: {
  alt: string
  aspectClass: string
  className?: string
  children: ReactNode
  dense?: boolean
  fill?: boolean
  hero?: boolean
  frameless?: boolean
}) {
  const stretch = fill || hero

  return (
    <div
      className={cn(
        "relative isolate min-h-0 overflow-hidden bg-[#F8F6F0]",
        frameless
          ? "h-full rounded-none border-0 bg-transparent shadow-none"
          : dense
            ? "rounded-none border-0 shadow-none"
            : "rounded-[1.5rem] border border-[#E4DED1] shadow-[0_24px_80px_rgba(15,17,16,0.12)] sm:rounded-[1.75rem]",
        aspectClass,
        className
      )}
      role="img"
      aria-label={alt}
    >
      {!frameless && (
        dense ? (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#F8F6F0_0%,#FFFFFF_100%)]" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,122,204,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.95),rgba(246,243,235,0.75))]" />
            {!stretch && (
              <div className="absolute inset-x-8 top-8 hidden h-px bg-gradient-to-r from-transparent via-[#007ACC]/25 to-transparent sm:block" />
            )}
          </>
        )
      )}
      <div
        className={cn(
          "relative min-h-0 w-full",
          stretch ? "flex h-full flex-col p-3 sm:p-4" : dense ? "h-full p-3 sm:p-4" : "h-full p-4 sm:p-6"
        )}
      >
        {children}
      </div>
    </div>
  )
}

function mockupOuterClass(compact: boolean, fill = false) {
  const stretch = compact || fill
  return stretch ? "flex h-full w-full items-stretch" : "flex h-full items-center justify-center"
}

function mockupPanelClass(compact: boolean, wide = false, fill = false) {
  const stretch = compact || fill
  return cn(
    "min-h-0 overflow-hidden border bg-white tabular-nums",
    stretch
      ? "flex h-full w-full flex-col rounded-xl border-[#DCE2E5] bg-white shadow-[0_4px_16px_rgba(15,17,16,0.04)] sm:rounded-2xl"
      : cn(
          "border-[#E4DED1] shadow-xl",
          wide ? "h-[88%] w-[94%] rounded-2xl border-[#D9D4C7]" : "h-[88%] w-[92%] rounded-3xl"
        )
  )
}

function PersonalMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("send")) {
    return <PersonalSendMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("receive")) {
    return <PersonalReceiveMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("recipients")) {
    return <PersonalRecipientsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("security")) {
    return <PersonalSecurityMockup compact={compact} fill={fill} />
  }
  return <PersonalHeroMockup compact={compact} fill={fill} />
}

function PersonalPhoneFrame({ compact, fill = false, children }: { compact: boolean; fill?: boolean; children: ReactNode }) {
  const stretch = compact || fill

  return (
    <div className={cn("flex h-full w-full min-h-0", stretch ? "items-stretch justify-center" : "items-center justify-center")}>
      <div
        className={cn(
          "relative flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border-[7px] border-[#0F1110] bg-[#0F1110] shadow-xl sm:rounded-[2rem] sm:border-[8px]",
          stretch
            ? "mx-auto h-full w-full max-w-[12.5rem] min-[430px]:max-w-[13rem] sm:max-w-[15rem]"
            : "h-[92%] w-[min(52%,15rem)] min-w-[10rem] max-h-[30rem]"
        )}
      >
        <div className="absolute left-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/15 sm:w-12" />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.25rem] bg-[#F6F3EB] p-2.5 sm:rounded-[1.35rem] sm:p-3">{children}</div>
      </div>
    </div>
  )
}

function PersonalHeroMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const activity = [
    { label: "Sent to Amara O.", amount: "−$250", tone: "text-[#6F756F]" },
    { label: "Received · USD", amount: "+$1,200", tone: "text-[#0F8A5F]" },
    { label: "NGN payout", amount: "−₦840k", tone: "text-[#007ACC]" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <PersonalPhoneFrame compact={compact || fill} fill={fill}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Easner Mobile</div>
            <div className="mt-0.5 text-base font-semibold text-[#0F1110] sm:text-lg">$8,420.18</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007ACC] text-white">
            <Smartphone className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          <div className="rounded-full bg-[#EAF5FD] px-2.5 py-1 text-[10px] font-semibold text-[#007ACC]">USD</div>
          <div className="rounded-full bg-[#F8F6F0] px-2.5 py-1 text-[10px] font-semibold text-[#6F756F]">EUR</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniAction icon={Send} label="Send" />
          <MiniAction icon={Banknote} label="Receive" />
        </div>
        <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-hidden">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Recent activity</div>
          {(compact ? activity.slice(0, 2) : activity).map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-2 shadow-sm">
              <span className="truncate text-[10px] font-medium text-[#0F1110]">{item.label}</span>
              <span className={cn("shrink-0 text-[10px] font-semibold", item.tone)}>{item.amount}</span>
            </div>
          ))}
        </div>
      </PersonalPhoneFrame>
    </div>
  )
}

function PersonalSendMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <PersonalPhoneFrame compact={compact || fill} fill={fill}>
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Send</div>
        <div className="mt-1 text-sm font-semibold text-[#0F1110]">Amara O.</div>
        <div className="mt-3 rounded-xl bg-[#0F1110] p-3 text-white">
          <div className="text-[9px] text-white/50">Amount</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-xl font-semibold">$250</span>
            <span className="rounded-full bg-white/12 px-2 py-0.5 text-[9px]">USD → NGN</span>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-[#E9E4D8] bg-white px-2.5 py-2">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Fee</div>
          <div className="mt-0.5 text-[11px] font-medium text-[#0F1110]">$2.40 · shown before confirm</div>
        </div>
        <div className="mt-auto rounded-xl bg-[#007ACC] py-2.5 text-center text-[11px] font-semibold text-white">Review send</div>
      </PersonalPhoneFrame>
    </div>
  )
}

function PersonalReceiveMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <PersonalPhoneFrame compact={compact || fill} fill={fill}>
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Receive</div>
        <div className="mt-1 text-sm font-semibold text-[#0F1110]">Get paid</div>
        <div className="mt-3 rounded-lg border border-[#E9E4D8] bg-white p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Account details</div>
          <div className="mt-1 text-[10px] font-medium text-[#0F1110]">Account details · •••• 9012</div>
        </div>
        <div className="mt-2 rounded-lg bg-[#0F1110] p-2.5 text-white">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">Stablecoin deposit</div>
          <div className="mt-1 font-mono text-[10px]">0x7a2f…9c4b</div>
        </div>
        {!compact && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-[#E8F7F0] bg-[#F0FBF6] px-2.5 py-2">
            <CheckCircle2 className="h-3 w-3 text-[#0F8A5F]" />
            <span className="text-[10px] font-medium text-[#0F8A5F]">Last received +$1,200</span>
          </div>
        )}
      </PersonalPhoneFrame>
    </div>
  )
}

function PersonalRecipientsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const recipients = [
    { name: "Amara O.", tag: "@amara", initial: "A" },
    { name: "Nuel K.", tag: "@nuel", initial: "N" },
    { name: "Maya R.", tag: "@maya", initial: "M" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <PersonalPhoneFrame compact={compact || fill} fill={fill}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Recipients</div>
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">EASETAG</div>
          </div>
          <UserRoundPlus className="h-4 w-4 text-[#007ACC]" />
        </div>
        <div className="mt-3 space-y-2">
          {(compact ? recipients.slice(0, 2) : recipients).map((person) => (
            <div key={person.tag} className="flex items-center gap-2.5 rounded-lg bg-white p-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F1110] text-[10px] font-semibold text-white">
                {person.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-[#0F1110]">{person.name}</div>
                <div className="text-[10px] text-[#007ACC]">{person.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </PersonalPhoneFrame>
    </div>
  )
}

function PersonalSecurityMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const items = [
    { label: "Multi-factor auth", status: "On", icon: ShieldCheck },
    { label: "PIN lock", status: "On", icon: LockKeyhole },
    { label: "Biometric unlock", status: "Face ID", icon: Smartphone },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <PersonalPhoneFrame compact={compact || fill} fill={fill}>
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Security</div>
        <div className="mt-1 text-sm font-semibold text-[#0F1110]">Account protection</div>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-[#E9E4D8] bg-white px-2.5 py-2.5">
              <div className="flex items-center gap-2">
                <item.icon className="h-3.5 w-3.5 text-[#007ACC]" />
                <span className="text-[11px] font-medium text-[#0F1110]">{item.label}</span>
              </div>
              <span className="rounded-full bg-[#E8F7F0] px-2 py-0.5 text-[9px] font-semibold text-[#0F8A5F]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </PersonalPhoneFrame>
    </div>
  )
}

function BusinessMockup({ assetId }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("accounts")) {
    return <BusinessFeatureMockup kind="accounts" />
  }
  if (assetId.includes("send")) {
    return <BusinessFeatureMockup kind="send" />
  }
  if (assetId.includes("collections")) {
    return <BusinessFeatureMockup kind="collections" />
  }
  if (assetId.includes("team")) {
    return <BusinessFeatureMockup kind="team" />
  }
  return <BusinessFeatureMockup kind="accounts" />
}

function StablecoinMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("hero-stablecoin")) {
    return <StablecoinHeroMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("terminal")) {
    return <StablecoinTerminalMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("qr")) {
    return <StablecoinQrMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("receive")) {
    return <StablecoinReceiveMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("send")) {
    return <StablecoinTransferPreview />
  }
  return <StablecoinReceiveMockup compact={compact} fill={fill} />
}

function StablecoinHeroMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const activity = [
    { label: "USDC received", detail: "Meridian Labs", amount: "+$12,400", time: "4 min", tone: "text-[#0F8A5F]" },
    { label: "EURC sent", detail: "Oakridge Trading", amount: "−€8,200", time: "11 min", tone: "text-[#007ACC]" },
    { label: "Terminal collection", detail: "QR Pay · In person", amount: "$128", time: "2 min", tone: "text-[#6F756F]" },
    { label: "USDC sent", detail: "Nova Consultancy", amount: "−$6,250", time: "28 min", tone: "text-[#007ACC]" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={mockupPanelClass(compact, true, fill)}>
        <div className={MOCKUP_CHROME_BAR}>
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/30 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/20 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/20 sm:h-2.5 sm:w-2.5" />
          <div className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-medium text-white/70 sm:px-3 sm:py-1 sm:text-[10px]">
            Easner Business
          </div>
        </div>
        <div className={MOCKUP_DASHBOARD_GRID}>
          <div className="hidden border-r border-[#E9E4D8] bg-[#F8F6F0] p-3 sm:block">
            <div className="mb-4 text-lg font-bold tracking-tight text-[#007ACC]">Easner</div>
            {["Receive", "Send", "Terminal", "QR Pay"].map((item, index) => (
              <div
                key={item}
                className={cn(
                  "mb-1.5 rounded-xl px-2.5 py-2 text-[11px]",
                  index === 0 ? "bg-[#EAF5FD] font-semibold text-[#007ACC]" : "text-[#6F756F]"
                )}
              >
                {item}
              </div>
            ))}
          </div>
          <div className={cn("flex min-h-0 flex-col p-3 sm:p-4", fill && "overflow-hidden")}>
            <div className="min-h-0 flex-1 rounded-xl border border-[#E9E4D8] bg-white p-2.5 sm:p-3">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">
                Recent settlement
              </div>
              <div className="space-y-2">
                {(compact ? activity.slice(0, 2) : fill ? activity.slice(0, 3) : activity).map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2 rounded-lg bg-[#F8F6F0] px-2.5 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-[11px] font-semibold text-[#0F1110]">{item.label}</div>
                      <div className="truncate text-[10px] text-[#6F756F]">{item.detail}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={cn("text-[11px] font-semibold", item.tone)}>{item.amount}</div>
                      <div className="text-[10px] text-[#6F756F]">{item.time} ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StablecoinReceiveMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), "overflow-hidden p-0")}>
        <div className="flex h-9 shrink-0 items-center justify-between bg-[#0F1110] px-3.5">
          <span className="text-[10px] font-semibold text-white/80">Stablecoin receive</span>
          <WalletCards className="h-4 w-4 text-[#3AA6F8]" />
        </div>
        <div className={cn("flex flex-1 flex-col", compact ? "p-3" : "p-4")}>
          <div className="text-sm font-semibold text-[#0F1110]">Deposit to your account</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="rounded-full border border-[#BFE3FA] bg-[#EAF5FD] px-2.5 py-1">
              <CurrencyBadge code="USDC" labelClassName="text-[11px] text-[#007ACC]" />
            </div>
            <div className="rounded-full border border-[#E9E4D8] bg-[#F8F6F0] px-2.5 py-1 opacity-70">
              <CurrencyBadge code="EURC" labelClassName="text-[11px] text-[#6F756F]" />
            </div>
            <span className="self-center rounded-full bg-[#F8F6F0] px-2 py-0.5 text-[10px] font-medium text-[#6F756F]">
              Ethereum
            </span>
          </div>
          <div className="mt-3 rounded-xl bg-[#0F1110] p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">Deposit address</div>
              <Copy className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div className="mt-1.5 font-mono text-[11px] text-white/90">0x7a2f…9c4b</div>
          </div>
          {!compact && (
            <div className="mt-2.5 rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Memo (optional)</div>
              <div className="mt-1 text-xs font-medium text-[#0F1110]">REF-2026-044</div>
            </div>
          )}
          <div className="mt-auto flex items-center gap-2 rounded-xl border border-[#E8F7F0] bg-[#F0FBF6] px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0F8A5F]" />
            <span className="text-[11px] font-medium text-[#0F8A5F]">Last deposit +$12,400 · 2h ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StablecoinTerminalMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), "overflow-hidden p-0")}>
        <div className="flex flex-1 flex-col bg-[#0F1110] p-4 text-white">
          <div className="flex items-center justify-between">
            <SquareTerminal className="h-6 w-6 text-[#3AA6F8]" />
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/70">Terminal</span>
          </div>
          <div className="mt-1 text-[11px] text-white/45">Oakridge Trading · In person</div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Amount due</div>
              <div className="mt-1 text-3xl font-semibold">$128.00</div>
            </div>
            <div className="relative flex h-12 w-12 items-center justify-center">
              <span className="absolute inset-0 animate-pulse rounded-full bg-[#3AA6F8]/20" />
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#3AA6F8]/30">
                <WalletCards className="h-4 w-4 text-[#3AA6F8]" />
              </span>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-white/10 p-3 text-center text-xs text-white/70">Tap, card, or scan to pay</div>
          <div className="mt-auto flex items-center gap-2 rounded-xl border border-[#0F8A5F]/30 bg-[#0F8A5F]/10 px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0F8A5F]" />
            <span className="text-[11px] font-medium text-[#7FE0B8]">Settled to Business ledger</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StablecoinQrMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "p-4")}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">QR Pay</div>
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">Field collection</div>
          </div>
          <QrCode className="h-5 w-5 text-[#007ACC]" />
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="grid h-[5.5rem] w-[5.5rem] grid-cols-5 gap-0.5 rounded-xl bg-[#0F1110] p-2">
              {Array.from({ length: 25 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "rounded-sm",
                    [0, 1, 5, 6, 12, 18, 19, 23, 24, 8, 16].includes(index) ? "bg-white" : "bg-white/20"
                  )}
                />
              ))}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F8A5F] shadow-md">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-semibold text-[#0F1110]">$250.00</div>
            <div className="mt-0.5 text-[11px] text-[#6F756F]">Meridian Labs Ltd</div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#E8F7F0] px-2.5 py-1 text-[10px] font-semibold text-[#0F8A5F]">
              <CheckCircle2 className="h-3 w-3" />
              Payment received
            </div>
          </div>
        </div>
        {!compact && (
          <div className="mt-3 rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2.5 text-[11px] text-[#6F756F]">
            Reconciled to Easner Business · Account ·••• 9012
          </div>
        )}
      </div>
    </div>
  )
}

function InvoiceMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("hero-invoicing")) {
    return <InvoiceDocumentMockup />
  }
  if (assetId.includes("online-payin")) {
    return <InvoiceOnlinePayinMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("bank-payin")) {
    return <InvoiceDetailsMockup />
  }
  if (assetId.includes("stablecoin-payin")) {
    return <InvoiceDetailsMockup stablecoin />
  }
  if (assetId.includes("customers")) {
    return <InvoiceCustomersPreview />
  }
  if (assetId.includes("editor")) {
    return <InvoiceDocumentMockup draft />
  }
  return <InvoicePayinMockup compact={compact} fill={fill} />
}

function InvoiceOnlinePayinMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Pay invoice</div>
            <div className="mt-1 text-xl font-semibold text-[#0F1110]">INV-1042 · $4,800</div>
          </div>
          <CreditCard className="h-7 w-7 text-[#007ACC]" />
        </div>
        <div className="mt-5 flex gap-2">
          <div className="rounded-full bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">Pay online</div>
          <div className="rounded-full bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#6F756F]">Bank transfer</div>
          <div className="rounded-full bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#6F756F]">Stablecoin</div>
        </div>
        <div className="mt-5 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Card or bank debit</div>
          <div className="mt-1 text-xs font-medium text-[#0F1110]">•••• •••• •••• 4242</div>
        </div>
        {!compact && (
          <div className="mt-3 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Reference</div>
            <div className="mt-1 text-xs font-medium text-[#0F1110]">INV-1042</div>
          </div>
        )}
        <div className="mt-5 rounded-xl bg-[#007ACC] py-2.5 text-center text-xs font-semibold text-white">Pay $4,800.00</div>
      </div>
    </div>
  )
}

function InvoicePayinMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div
        className={cn(
          compact ? "h-full w-full" : "grid h-[88%] w-[92%] gap-4 md:grid-cols-[1fr_0.8fr]"
        )}
      >
        <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
          <div className="flex items-center justify-between">
            <ReceiptText className="h-7 w-7 text-[#007ACC]" />
            <div className="rounded-full bg-[#EAF5FD] px-3 py-1 text-xs font-semibold text-[#0A2540]">Open invoice</div>
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

function ApiMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("dev-panel")) {
    return <ApiDevPanelMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("identity")) {
    return <ApiIdentityMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("payin")) {
    return <ApiPayinMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("payouts")) {
    return <ApiPayoutsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("webhooks")) {
    return <ApiWebhooksMockup compact={compact} fill={fill} />
  }
  return <IntegrationWorkflowPreview />
}

function ApiIdentityMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const customers = [
    { name: "Meridian Labs", status: "Approved", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { name: "Oakridge Trading", status: "Pending", tone: "text-[#B45309] bg-[#FEF3C7]" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), "overflow-hidden p-0")}>
        <div className="flex h-9 items-center justify-between bg-[#0F1110] px-3.5">
          <span className="text-[10px] font-semibold text-white/80">Customer verification</span>
          <Users2 className="h-4 w-4 text-[#3AA6F8]" />
        </div>
        <div className={cn("flex flex-1 flex-col", compact ? "p-3" : "p-4")}>
          <div className="text-sm font-semibold text-[#0F1110]">Verification sync</div>
          <div className="mt-3 space-y-2">
            {(compact ? customers.slice(0, 1) : customers).map((customer) => (
              <div key={customer.name} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2.5">
                <div>
                  <div className="text-[11px] font-semibold text-[#0F1110]">{customer.name}</div>
                  <div className="text-[10px] text-[#6F756F]">external_id · org record</div>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", customer.tone)}>
                  {customer.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-xl border border-[#BFE3FA] bg-[#EAF5FD] px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#007ACC]">Hosted KYC/KYB</div>
            <div className="mt-1 text-[11px] text-[#0A2540]">Embed flows or sync verification status</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApiPayinMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Accounts & pay-in</div>
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">Provision funding rails</div>
          </div>
          <Landmark className="h-5 w-5 text-[#007ACC]" />
        </div>
        <div className="mt-3 rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Virtual account</div>
          <div className="mt-1 text-xs font-medium text-[#0F1110]">Account details · •••• 9012</div>
        </div>
        <div className="mt-2.5 rounded-xl bg-[#0F1110] p-3 text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">Deposit address</div>
          <div className="mt-1 font-mono text-[11px]">0x7a2f…9c4b · USDC</div>
        </div>
        {!compact && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-[#E8F7F0] bg-[#F0FBF6] px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0F8A5F]" />
            <span className="text-[11px] font-medium text-[#0F8A5F]">Account provisioned · acct_8f2a</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ApiPayoutsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Payout quote example</div>
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">FX quote response</div>
          </div>
          <ArrowRightLeft className="h-5 w-5 text-[#007ACC]" />
        </div>
        <div className="mt-2 rounded-2xl bg-[#0F1110] p-3 font-mono text-[11px] leading-5 text-white/85">
          <div className="text-white/35">{"{"}</div>
          <div className="pl-3">
            <span className="text-[#7DD3FC]">&quot;source&quot;</span>: &quot;USD&quot;,
          </div>
          <div className="pl-3">
            <span className="text-[#7DD3FC]">&quot;destination&quot;</span>: &quot;EUR&quot;,
          </div>
          <div className="pl-3">
            <span className="text-[#7DD3FC]">&quot;amount&quot;</span>: &quot;1000.00&quot;,
          </div>
          <div className="pl-3">
            <span className="text-[#7DD3FC]">&quot;rate&quot;</span>: &quot;0.9214&quot;
          </div>
          <div className="text-white/35">{"}"}</div>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-[#EAF5FD] px-3 py-2.5">
          <span className="text-[11px] font-medium text-[#0A2540]">Review before sending</span>
          <div className="rounded-lg bg-[#007ACC] px-2.5 py-1 text-[10px] font-semibold text-white">Confirm</div>
        </div>
      </div>
    </div>
  )
}

function ApiWebhooksMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const events = [
    { name: "verification.approved", time: "2 min ago", tone: "text-[#0F8A5F]" },
    { name: "payin.received", time: "8 min ago", tone: "text-[#007ACC]" },
    { name: "payout.completed", time: "14 min ago", tone: "text-[#6F756F]" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), "overflow-hidden p-0")}>
        <div className="flex h-9 items-center justify-between bg-[#0F1110] px-3.5">
          <span className="text-[10px] font-semibold text-white/80">Webhook events</span>
          <LockKeyhole className="h-4 w-4 text-[#3AA6F8]" />
        </div>
        <div className={cn("flex flex-1 flex-col", compact ? "p-3" : "p-4")}>
          <div className="rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2 text-[11px] text-[#6F756F]">
            https://api.example.com/payment-events
          </div>
          <div className="mt-3 space-y-2">
            {(compact ? events.slice(0, 2) : events).map((event) => (
              <div key={event.name} className="flex items-center justify-between rounded-lg border border-[#E9E4D8] bg-white px-3 py-2">
                <span className={cn("font-mono text-[10px] font-semibold", event.tone)}>{event.name}</span>
                <span className="text-[10px] text-[#6F756F]">{event.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto text-[10px] text-[#6F756F]">Signed payloads · verify on your backend</div>
        </div>
      </div>
    </div>
  )
}

function ApiDevPanelMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, true, fill), "overflow-hidden p-0")}>
        <div className="flex h-10 items-center gap-2 border-b border-[#E9E4D8] bg-[#0F1110] px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F6F3EB]/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F6F3EB]/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F6F3EB]/20" />
          <div className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/70">
            Developer workspace
          </div>
        </div>
        <div className={cn("grid min-h-0 flex-1 gap-3", compact ? "p-3" : "p-4 sm:grid-cols-2")}>
          <div className="rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">API keys</div>
            <div className="mt-2 space-y-1.5">
              <div className="rounded-lg bg-white px-2.5 py-2 font-mono text-[10px] text-[#0F1110]">sk_test_••••••••4f2a</div>
              <div className="rounded-lg bg-white px-2.5 py-2 font-mono text-[10px] text-[#0F1110]">sk_live_••••••••9c1b</div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E9E4D8] bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Recent events</div>
            <div className="mt-2 space-y-1.5">
              {["payout.completed", "payin.received", "verification.approved"].map((event) => (
                <div key={event} className="flex items-center gap-2 rounded-lg bg-[#F8F6F0] px-2.5 py-1.5">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-[#0F8A5F]" />
                  <span className="font-mono text-[10px] text-[#0F1110]">{event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnersMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("faith")) {
    return <PartnersFaithMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("agency")) {
    return <PartnersAgencyMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("compliance")) {
    return <PartnersComplianceMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("rails")) {
    return <PartnersRailsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("operations")) {
    return <PartnersOperationsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("branded")) {
    return <PartnersBrandedMockup compact={compact} fill={fill} />
  }
  return <PartnersHeroMockup compact={compact} fill={fill} />
}

function PartnersHeroMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const transactions = [
    { ref: "TXN-4821", corridor: "USD → NGN", status: "Cleared", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { ref: "TXN-4819", corridor: "USD → MXN", status: "Screening", tone: "text-[#B45309] bg-[#FEF3C7]" },
    { ref: "TXN-4816", corridor: "USD → PHP", status: "Cleared", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, true, fill), "overflow-hidden p-0")}>
        <div className={MOCKUP_CHROME_BAR}>
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/30 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/20 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/20 sm:h-2.5 sm:w-2.5" />
          <div className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-medium text-white/70 sm:px-3 sm:py-1 sm:text-[10px]">
            Acme Remittance · Partner portal
          </div>
        </div>
        <div className={MOCKUP_DASHBOARD_GRID}>
          <div className="hidden border-r border-[#E9E4D8] bg-[#F8F6F0] p-3 sm:block">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#007ACC] text-[10px] font-bold text-white">
                AR
              </div>
              <div className="text-[11px] font-semibold text-[#0F1110]">Acme Remittance</div>
            </div>
            {["Counter", "Transactions", "Compliance", "Reports"].map((item, index) => (
              <div
                key={item}
                className={cn(
                  "mb-1.5 rounded-xl px-2.5 py-2 text-[11px]",
                  index === 0 ? "bg-[#EAF5FD] font-semibold text-[#007ACC]" : "text-[#6F756F]"
                )}
              >
                {item}
              </div>
            ))}
          </div>
          <div className={cn("flex min-h-0 flex-col p-3 sm:p-4", fill && "overflow-hidden")}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Transfers</div>
                <div className="mt-0.5 text-sm font-semibold text-[#0F1110] sm:text-base">Today&apos;s transfers</div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-[#E8F7F0] px-2 py-1 text-[10px] font-semibold text-[#0F8A5F]">
                <ShieldCheck className="h-3 w-3" />
                Compliant
              </div>
            </div>
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-hidden">
              {(compact ? transactions.slice(0, 2) : transactions).map((txn) => (
                <div key={txn.ref} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-white px-3 py-2.5">
                  <div>
                    <div className="text-[11px] font-semibold text-[#0F1110]">{txn.ref}</div>
                    <div className="text-[10px] text-[#6F756F]">{txn.corridor}</div>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", txn.tone)}>{txn.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto rounded-xl border border-[#BFE3FA] bg-[#EAF5FD] px-3 py-2 text-[10px] text-[#0A2540]">
              Powered by Easner · audit trail on every transfer
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnersBrandedMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Branded deployment</div>
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">Your name, your customers</div>
          </div>
          <Briefcase className="h-5 w-5 text-[#007ACC]" />
        </div>
        <div className="mt-3 rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Partner brand</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007ACC] text-xs font-bold text-white">
              YB
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0F1110]">YourBrand Remittance</div>
              <div className="text-[10px] text-[#6F756F]">portal.yourbrand.com</div>
            </div>
          </div>
        </div>
        {!compact && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-[#E8F7F0] px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0F8A5F]" />
            <span className="text-[11px] font-medium text-[#0F8A5F]">Live on Easner infrastructure</span>
          </div>
        )}
      </div>
    </div>
  )
}

function PartnersComplianceMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const checks = [
    { label: "KYC verified", status: "Pass" },
    { label: "AML screening", status: "Pass" },
    { label: "Sanctions check", status: "Pass" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), "overflow-hidden p-0")}>
        <div className="flex h-9 items-center justify-between bg-[#0F1110] px-3.5">
          <span className="text-[10px] font-semibold text-white/80">Compliance queue</span>
          <ShieldCheck className="h-4 w-4 text-[#3AA6F8]" />
        </div>
        <div className={cn("flex flex-1 flex-col", compact ? "p-3" : "p-4")}>
          <div className="text-sm font-semibold text-[#0F1110]">TXN-4821 · audit trail</div>
          <div className="mt-3 space-y-2">
            {(compact ? checks.slice(0, 2) : checks).map((check) => (
              <div key={check.label} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2">
                <span className="text-[11px] font-medium text-[#0F1110]">{check.label}</span>
                <span className="rounded-full bg-[#E8F7F0] px-2 py-0.5 text-[10px] font-semibold text-[#0F8A5F]">
                  {check.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-xl border border-[#BFE3FA] bg-[#EAF5FD] px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#007ACC]">Full audit trail</div>
            <div className="mt-1 text-[11px] text-[#0A2540]">Every transfer documented and reviewable</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnersRailsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const corridors = [
    { route: "USD → NGN", volume: "$124k" },
    { route: "USD → MXN", volume: "$86k" },
    { route: "EUR → INR", volume: "€42k" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Global rails</div>
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">Corridor connectivity</div>
          </div>
          <Globe2 className="h-5 w-5 text-[#007ACC]" />
        </div>
        <div className="mt-3 space-y-2">
          {(compact ? corridors.slice(0, 2) : corridors).map((corridor) => (
            <div key={corridor.route} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-3.5 w-3.5 text-[#007ACC]" />
                <span className="text-[11px] font-semibold text-[#0F1110]">{corridor.route}</span>
              </div>
              <span className="text-[10px] font-medium text-[#6F756F]">{corridor.volume}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PartnersOperationsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const systems = [
    { name: "Infrastructure", status: "Healthy" },
    { name: "Provider connectivity", status: "Active" },
    { name: "Partner support", status: "On call" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Operations</div>
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">Ongoing partner support</div>
          </div>
          <Clock3 className="h-5 w-5 text-[#007ACC]" />
        </div>
        <div className="mt-3 space-y-2">
          {(compact ? systems.slice(0, 2) : systems).map((system) => (
            <div key={system.name} className="flex items-center justify-between rounded-xl bg-[#F8F6F0] px-3 py-2.5">
              <span className="text-[11px] font-medium text-[#0F1110]">{system.name}</span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0F8A5F]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0F8A5F]" />
                {system.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PartnersFaithMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const gifts = [
    { label: "Diaspora offering", corridor: "USD → NGN", amount: "$12,400", status: "Cleared", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { label: "Mission support", corridor: "USD → PHP", amount: "$8,200", status: "Cleared", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { label: "Branch payout", corridor: "USD → MXN", amount: "$3,600", status: "Processing", tone: "text-[#B45309] bg-[#FEF3C7]" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, true, fill), "overflow-hidden p-0")}>
        <div className={MOCKUP_CHROME_BAR}>
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/30 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/20 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#F6F3EB]/20 sm:h-2.5 sm:w-2.5" />
          <div className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-medium text-white/70 sm:px-3 sm:py-1 sm:text-[10px]">
            Grace Network · Giving portal
          </div>
        </div>
        <div className={MOCKUP_DASHBOARD_GRID}>
          <div className="hidden border-r border-[#E9E4D8] bg-[#F8F6F0] p-3 sm:block">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6B4E9B] text-[10px] font-bold text-white">
                GN
              </div>
              <div className="text-[11px] font-semibold text-[#0F1110]">Grace Network</div>
            </div>
            {["Diaspora giving", "Mission payouts", "Branches", "Compliance"].map((item, index) => (
              <div
                key={item}
                className={cn(
                  "mb-1.5 rounded-xl px-2.5 py-2 text-[11px]",
                  index === 0 ? "bg-[#F3EEFB] font-semibold text-[#6B4E9B]" : "text-[#6F756F]"
                )}
              >
                {item}
              </div>
            ))}
          </div>
          <div className={cn("flex min-h-0 flex-col p-3 sm:p-4", fill && "overflow-hidden")}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Diaspora giving</div>
                <div className="mt-0.5 text-sm font-semibold text-[#0F1110] sm:text-base">This month</div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-[#F3EEFB] px-2 py-1 text-[10px] font-semibold text-[#6B4E9B]">
                <HandHeart className="h-3 w-3" />
                Branded
              </div>
            </div>
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-hidden">
              {(compact ? gifts.slice(0, 2) : gifts).map((gift) => (
                <div key={gift.label} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-white px-3 py-2.5">
                  <div>
                    <div className="text-[11px] font-semibold text-[#0F1110]">{gift.label}</div>
                    <div className="text-[10px] text-[#6F756F]">
                      {gift.corridor} · {gift.amount}
                    </div>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", gift.tone)}>{gift.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto rounded-xl border border-[#E9D8F5] bg-[#F3EEFB] px-3 py-2 text-[10px] text-[#4A3568]">
              Your organization&apos;s name · audit trail on every transfer
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnersAgencyMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const layers = [
    { label: "Your brand & customers", tone: "border-[#007ACC] bg-[#EAF5FD] text-[#007ACC]" },
    { label: "Easner orchestration & compliance", tone: "border-[#E9E4D8] bg-[#F8F6F0] text-[#0F1110]" },
    { label: "Banking, wallet & payout rails", tone: "border-[#0F1110] bg-[#0F1110] text-white" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, true, fill), compact ? "p-3" : "p-4")}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Agency Model</div>
        <div className="mt-1 text-sm font-semibold text-[#0F1110] sm:text-base">Branded layer on Easner</div>
        <div className="mt-4 space-y-2.5">
          {layers.map((layer, index) => (
            <div key={layer.label} className="relative">
              <div className={cn("rounded-xl border px-3 py-3 text-center text-[11px] font-semibold sm:text-xs", layer.tone)}>
                {layer.label}
              </div>
              {index < layers.length - 1 && (
                <div className="mx-auto my-1 h-3 w-px bg-[#D9D4C7]" aria-hidden />
              )}
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#6F756F]">
            <Users2 className="h-3.5 w-3.5" />
            Full-stack deployment · not a DIY integration
          </div>
        )}
      </div>
    </div>
  )
}

function CardMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("hero-cards")) {
    return <CardsPreview />
  }
  if (assetId.includes("issue")) {
    return <IssueCardPreview />
  }
  if (assetId.includes("cardholders")) {
    return <CardholdersMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("reporting")) {
    return <CardReportingMockup compact={compact} fill={fill} />
  }
  return <CardControlsMockup compact={compact} fill={fill} />
}

function CardControlsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const policies = [
    { name: "Monthly limit", detail: "$5,000 per cardholder", enabled: true, meter: 68 },
    { name: "Travel and hotels", detail: "Airlines, lodging, car rental", enabled: true },
    { name: "Software vendors", detail: "SaaS, cloud, dev tools", enabled: true },
    { name: "Block gambling", detail: "Restricted merchant category", enabled: true, blocked: true },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Spend policies</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Team guardrails</div>
          </div>
          <div className="rounded-full bg-[#EAF5FD] px-3 py-1 text-xs font-semibold text-[#0A2540]">Policy preview</div>
        </div>
        <div className="mt-4 space-y-3">
          {(compact ? policies.slice(0, 2) : policies).map((policy) => (
            <div key={policy.name} className="rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0F1110]">{policy.name}</div>
                  <div className="mt-0.5 text-[10px] text-[#6F756F]">{policy.detail}</div>
                </div>
                <div
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                    policy.blocked ? "bg-[#FEE2E2] text-[#B91C1C]" : "bg-[#E8F7F0] text-[#0F8A5F]"
                  )}
                >
                  {policy.blocked ? "Blocked" : "On"}
                </div>
              </div>
              {policy.meter !== undefined && (
                <div className="mt-3 h-2 rounded-full bg-[#E9E4D8]">
                  <div className="h-full rounded-full bg-[#007ACC]" style={{ width: `${policy.meter}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#D9D4C7] bg-white p-3 text-center text-xs font-semibold text-[#007ACC]">
            Add policy
          </div>
        )}
      </div>
    </div>
  )
}

function CardholdersMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const cardholders = [
    { name: "Amara O.", role: "Engineering", card: "Virtual · •••• 9041", status: "Active", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { name: "James K.", role: "Finance", card: "Physical · •••• 4829", status: "Active", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { name: "Ops team", role: "Shared", card: "Virtual · •••• 1182", status: "Frozen", tone: "text-[#6F756F] bg-[#F0EDE4]" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Cardholders</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">5 team members</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#007ACC] text-white">
            <UserRoundPlus className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          {(compact ? cardholders.slice(0, 2) : cardholders).map((holder) => (
            <div key={holder.name} className="rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F1110] text-sm font-semibold text-white">
                    {holder.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-[#0F1110]">{holder.name}</div>
                    <div className="truncate text-[10px] text-[#6F756F]">
                      {holder.role} · {holder.card}
                    </div>
                  </div>
                </div>
                <div className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold", holder.tone)}>
                  {holder.status}
                </div>
              </div>
              {!compact && (
                <div className="mt-3 flex gap-2">
                  <div className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-semibold text-[#6F756F]">View spend</div>
                  <div className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-semibold text-[#6F756F]">
                    {holder.status === "Frozen" ? "Unfreeze" : "Freeze card"}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#D9D4C7] bg-white p-3 text-center text-xs font-semibold text-[#007ACC]">
            Add cardholder
          </div>
        )}
      </div>
    </div>
  )
}

function CardReportingMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const activity = [
    { label: "Card · Figma subscription", meta: "James K. · 2h ago", amount: "-$129.00", type: "card" as const },
    { label: "Payout · Supplier wire", meta: "Finance · 4h ago", amount: "-$4,200.00", type: "payout" as const },
    { label: "Card · Travel booking", meta: "Amara O. · 6h ago", amount: "-$860.00", type: "card" as const },
    { label: "Collection · Invoice paid", meta: "Meridian Labs · 1d ago", amount: "+$4,800.00", type: "collection" as const },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">All activity</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Unified ledger</div>
          </div>
          <ReceiptText className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["All", "Cards", "Payouts", "Collections"].map((filter, index) => (
            <div
              key={filter}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                index === 0 ? "bg-[#007ACC] text-white" : "bg-[#F8F6F0] text-[#6F756F]"
              )}
            >
              {filter}
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {(compact ? activity.slice(0, 2) : activity).map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FD] text-[#007ACC]">
                  {item.type === "card" ? (
                    <CreditCard className="h-4 w-4" />
                  ) : item.type === "payout" ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <ReceiptText className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-[#0F1110]">{item.label}</div>
                  <div className="truncate text-[10px] text-[#6F756F]">{item.meta}</div>
                </div>
              </div>
              <div
                className={cn(
                  "shrink-0 text-xs font-semibold",
                  item.amount.startsWith("+") ? "text-[#0F8A5F]" : "text-[#0F1110]"
                )}
              >
                {item.amount}
              </div>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-4 flex items-center gap-2 text-[10px] text-[#6F756F]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0F8A5F]" />
            Card, payout, and collection activity in one export-ready ledger
          </div>
        )}
      </div>
    </div>
  )
}

function CheckoutMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("onetime")) {
    return <CheckoutOneTimeMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("subscription")) {
    return <CheckoutHostedMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("methods")) {
    return <CheckoutMethodsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("ledger")) {
    return <CheckoutLedgerMockup compact={compact} fill={fill} />
  }
  return <CustomerPaymentMockup />
}

function CheckoutOneTimeMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">One-time payment</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Onboarding package</div>
          </div>
          <ShoppingCart className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-4 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Amount due</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-2xl font-semibold text-[#0F1110]">$299.00</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#6F756F]">One-time</span>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-[#007ACC] py-2.5 text-center text-xs font-semibold text-white">Pay</div>
      </div>
    </div>
  )
}

function CheckoutHostedMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Subscription</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Nova Analytics Pro</div>
          </div>
          <ShoppingCart className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-4 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Amount due</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-2xl font-semibold text-[#0F1110]">$49.00</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#6F756F]">Monthly</span>
          </div>
        </div>
        {!compact && (
          <div className="mt-3 flex gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[#F8F6F0] px-3 py-1.5 text-[10px] font-semibold text-[#6F756F]">
              <CreditCard className="h-3.5 w-3.5" /> Card
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#F8F6F0] px-3 py-1.5 text-[10px] font-semibold text-[#6F756F]">
              <Landmark className="h-3.5 w-3.5" /> Bank
            </div>
          </div>
        )}
        <div className="mt-4 rounded-xl bg-[#007ACC] py-2.5 text-center text-xs font-semibold text-white">Pay</div>
      </div>
    </div>
  )
}

function CheckoutMethodsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const methods = [
    { label: "Card", icon: CreditCard },
    { label: "Bank", icon: Landmark },
    { label: "Apple / Google Pay", icon: Wallet },
    { label: "Stablecoin", icon: ArrowRightLeft },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Payment methods</div>
        <div className="mt-1 text-lg font-semibold text-[#0F1110]">Accepted at checkout</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(compact ? methods.slice(0, 2) : methods).map((method, index) => (
            <div
              key={method.label}
              className={cn(
                "flex items-center gap-2 rounded-xl border p-2.5",
                index === 0 ? "border-[#BFE3FA] bg-[#EAF5FD]" : "border-[#E9E4D8] bg-[#F8F6F0]"
              )}
            >
              <method.icon className={cn("h-4 w-4", index === 0 ? "text-[#007ACC]" : "text-[#6F756F]")} />
              <span className="text-[10px] font-semibold text-[#0F1110]">{method.label}</span>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-3 rounded-xl bg-[#0F1110] p-3 text-center text-[11px] text-white/80">
            One checkout for global customers
          </div>
        )}
      </div>
    </div>
  )
}

function CheckoutLedgerMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const activity = [
    { label: "Checkout · Nova Analytics Pro", amount: "+$49.00", icon: ShoppingCart },
    { label: "Subscription renewal", amount: "+$49.00", icon: Repeat },
    { label: "Checkout · Onboarding fee", amount: "+$250.00", icon: CreditCard },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Easner Balance</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Checkout activity</div>
          </div>
          <ReceiptText className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-4 space-y-2">
          {(compact ? activity.slice(0, 2) : activity).map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FD] text-[#007ACC]">
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <span className="truncate text-xs font-semibold text-[#0F1110]">{item.label}</span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-[#0F8A5F]">{item.amount}</span>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-[#6F756F]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0F8A5F]" />
            Reconciles with invoices, payouts, and card activity
          </div>
        )}
      </div>
    </div>
  )
}

function PayrollMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("approvals")) {
    return <PayrollApprovalsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("stubs")) {
    return <PayrollStubsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("mobile")) {
    return <PayrollMobileMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("reconcile")) {
    return <PayrollReconcileMockup compact={compact} fill={fill} />
  }
  return <PayrollRunMockup />
}

function PayrollApprovalsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Pending approval</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Payroll run · Sep 30</div>
          </div>
          <ClipboardCheck className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-4 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Total</span>
            <span className="text-sm font-semibold text-[#0F1110]">$28,400.00</span>
          </div>
          <div className="mt-1 text-[10px] text-[#6F756F]">Requested by Amara O. · Finance</div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-xl bg-[#0F1110] py-2 text-center text-[11px] font-semibold text-white">Approve</div>
          <div className="flex-1 rounded-xl border border-[#E9E4D8] bg-white py-2 text-center text-[11px] font-semibold text-[#6F756F]">
            Reject
          </div>
        </div>
        {!compact && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-[#6F756F]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0F8A5F]" />
            Maker-checker approval before funds move
          </div>
        )}
      </div>
    </div>
  )
}

function PayrollStubsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), "overflow-hidden p-0")}>
        <div className="flex h-9 shrink-0 items-center justify-between bg-[#0F1110] px-3.5">
          <span className="text-[10px] font-semibold text-white/80">Pay stub</span>
          <FileText className="h-4 w-4 text-white/60" />
        </div>
        <div className={cn("flex flex-1 flex-col", compact ? "p-3" : "p-4")}>
          <div className="text-sm font-semibold text-[#0F1110]">Amara O.</div>
          <div className="text-[10px] text-[#6F756F]">Pay period · Sep 1–30</div>
          <div className="mt-3 space-y-1.5">
            {[
              { label: "Gross pay", value: "$5,200.00" },
              { label: "Deductions", value: "-$0.00" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-[11px]">
                <span className="text-[#6F756F]">{row.label}</span>
                <span className="font-medium text-[#0F1110]">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-[#F8F6F0] px-2.5 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Net pay</span>
            <span className="text-sm font-semibold text-[#0F1110]">$5,200.00</span>
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-xl border border-[#E9E4D8] bg-white px-3 py-2">
            <Download className="h-3.5 w-3.5 text-[#007ACC]" />
            <span className="text-[11px] font-medium text-[#007ACC]">Download pay stub</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PayrollMobileMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <PersonalPhoneFrame compact={compact || fill} fill={fill}>
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Payroll</div>
        <div className="mt-1 text-sm font-semibold text-[#0F1110]">You're connected</div>
        <div className="mt-3 rounded-xl border border-[#E9E4D8] bg-white p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Employer</div>
          <div className="mt-1 text-[11px] font-medium text-[#0F1110]">Meridian Labs Ltd</div>
        </div>
        <div className="mt-2 rounded-xl border border-[#E9E4D8] bg-white p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Receive to</div>
          <div className="mt-1 text-[11px] font-medium text-[#0F1110]">USD account ·••• 9012</div>
        </div>
        {!compact && (
          <div className="mt-auto flex items-center gap-2 rounded-xl border border-[#E8F7F0] bg-[#F0FBF6] px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0F8A5F]" />
            <span className="text-[11px] font-medium text-[#0F8A5F]">Last pay stub · Sep 30</span>
          </div>
        )}
      </PersonalPhoneFrame>
    </div>
  )
}

function PayrollReconcileMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const activity = [
    { label: "Payroll · Amara O.", amount: "-$5,200.00" },
    { label: "Payroll · James K.", amount: "-$4,800.00" },
    { label: "Invoice paid · INV-1042", amount: "+$4,800.00" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="rounded-2xl bg-[#0F1110] p-4 text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Total balance</div>
          <div className="mt-1 text-xl font-semibold">$184,920.40</div>
          <div className="mt-1 text-[10px] text-white/45">Payroll settles with your other activity</div>
        </div>
        <div className="mt-3 space-y-2">
          {(compact ? activity.slice(0, 2) : activity).map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2.5">
              <span className="truncate text-[11px] font-medium text-[#0F1110]">{item.label}</span>
              <span
                className={cn(
                  "shrink-0 text-[11px] font-semibold",
                  item.amount.startsWith("+") ? "text-[#0F8A5F]" : "text-[#0F1110]"
                )}
              >
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PayLinksMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("create")) {
    return <PayLinksCreateMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("share")) {
    return <PayLinksShareMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("stats")) {
    return <PayLinksStatsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("ledger")) {
    return <PayLinksLedgerMockup compact={compact} fill={fill} />
  }
  return <CustomerPaymentMockup paymentLink />
}

function PayLinksCreateMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">New payment link</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Consulting retainer</div>
          </div>
          <Link2 className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="rounded-full bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">One-time</div>
          <div className="rounded-full bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#6F756F]">Recurring</div>
        </div>
        <div className="mt-3 rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Amount</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-xl font-semibold text-[#0F1110]">$500.00</span>
            <CurrencyBadge code="USD" labelClassName="text-xs" />
          </div>
        </div>
        {!compact && (
          <div className="mt-3 rounded-xl border border-[#E9E4D8] bg-white p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Link name</div>
            <div className="mt-0.5 text-xs font-medium text-[#0F1110]">Consulting retainer</div>
          </div>
        )}
        <div className="mt-3 rounded-xl bg-[#0F1110] py-2.5 text-center text-[11px] font-semibold text-white">
          Create link
        </div>
      </div>
    </div>
  )
}

function PayLinksShareMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Share this link</div>
        <div className="mt-1 text-lg font-semibold text-[#0F1110]">No website needed</div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <span className="truncate font-mono text-[11px] text-[#0F1110]">pay.easner.com/@amara/retainer</span>
          <Copy className="h-3.5 w-3.5 shrink-0 text-[#007ACC]" />
        </div>
        {!compact && (
          <div className="mt-3 flex gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F6F0] text-[#6F756F]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F6F0] text-[#6F756F]">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F6F0] text-[#6F756F]">
              <Globe2 className="h-4 w-4" />
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-[#6F756F]">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#0F8A5F]" />
          Ready to share by email, chat, or social
        </div>
      </div>
    </div>
  )
}

function PayLinksStatsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Consulting retainer</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Active link</div>
          </div>
          <div className="rounded-full bg-[#E8F7F0] px-2.5 py-1 text-[10px] font-semibold text-[#0F8A5F]">Open</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Payments</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">6</div>
          </div>
          <div className="rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Collected</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">$3,000</div>
          </div>
        </div>
        {!compact && (
          <div className="mt-3 rounded-xl border border-dashed border-[#D9D4C7] bg-white p-2.5 text-center text-[11px] text-[#6F756F]">
            Stays open until you close it
          </div>
        )}
      </div>
    </div>
  )
}

function PayLinksLedgerMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const activity = [
    { label: "Payment link · Consulting retainer", amount: "+$500.00" },
    { label: "Payment link · Onboarding fee", amount: "+$250.00" },
    { label: "Invoice paid · INV-1042", amount: "+$4,800.00" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="rounded-2xl bg-[#0F1110] p-4 text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Easner Balance</div>
          <div className="mt-1 text-xl font-semibold">$184,920.40</div>
          <div className="mt-1 text-[10px] text-white/45">Payment links settle with your other activity</div>
        </div>
        <div className="mt-3 space-y-2">
          {(compact ? activity.slice(0, 2) : activity).map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2.5">
              <span className="truncate text-[11px] font-medium text-[#0F1110]">{item.label}</span>
              <span className="shrink-0 text-[11px] font-semibold text-[#0F8A5F]">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TerminalMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  if (compact) {
    return (
      <div className={mockupOuterClass(compact, fill)}>
        <div className={cn(mockupPanelClass(compact, false, fill), "rounded-[1.25rem] bg-[#0F1110] p-4 text-white")}>
          <SquareTerminal className="h-7 w-7 text-[#3AA6F8]" />
          <div className="mt-4 text-2xl font-semibold">$128.00</div>
          <div className="mt-1 text-xs text-white/50">Ready to collect</div>
          <div className="mt-5 rounded-xl bg-white/10 p-3 text-center text-xs">Tap, scan, or share</div>
        </div>
      </div>
    )
  }

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

function QrPayMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  if (compact) {
    return (
      <div className={mockupOuterClass(compact, fill)}>
        <div className={cn(mockupPanelClass(compact, false, fill), "flex items-center gap-4 p-4")}>
          <div className="grid h-24 w-24 shrink-0 grid-cols-5 gap-0.5 rounded-xl bg-[#0F1110] p-2">
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "rounded-sm",
                  [0, 1, 5, 6, 18, 19, 23, 24, 12, 8, 16].includes(index) ? "bg-white" : "bg-white/20"
                )}
              />
            ))}
          </div>
          <div>
            <QrCode className="h-6 w-6 text-[#007ACC]" />
            <div className="mt-2 text-sm font-semibold text-[#0F1110]">QR Pay</div>
            <p className="mt-1 text-[11px] text-[#6F756F]">Scan to collect</p>
          </div>
        </div>
      </div>
    )
  }

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

function ComplianceMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
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

function PersonaMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
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
