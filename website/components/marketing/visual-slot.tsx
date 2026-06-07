"use client"

import Image, { type StaticImageData } from "next/image"
import type { ReactNode } from "react"
import {
  ArrowRightLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
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
import { getAssetImageFit, getAssetObjectPosition, getAssetUrl, getVisualKind, isPlaceholderOnly } from "@/lib/marketing/assets"
import { HERO_VISUAL_HEIGHT, MOCKUP_CHROME_BAR, MOCKUP_DASHBOARD_GRID } from "@/lib/marketing/layout-constants"
import { CorridorCoverageVisual } from "./corridor-coverage-visual"
import { CurrencyBadge } from "./currency-badge"

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
  "mkt-thumb-stablecoin": ArrowRightLeft,
  "mkt-thumb-invoicing": ReceiptText,
  "mkt-thumb-cards": CreditCard,
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

  if (!showMockup && url) {
    const imageFit = getAssetImageFit(assetId, kind, fill)
    const imageFitClass =
      imageFit === "cover"
        ? "object-cover"
        : kind === "persona"
          ? "object-contain p-3 sm:p-4"
          : "object-contain p-2 sm:p-3"

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
          className={imageFitClass}
          style={objectPosition ? { objectPosition } : undefined}
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
        <DashboardMockup assetId={assetId} compact={compact} fill={fill} />
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

  if (kind === "card") {
    return (
      <MockupFrame alt={alt} aspectClass={aspectClass} className={className} dense={dense} fill={fill} hero={isHero} frameless={frameless}>
        <CardMockup assetId={assetId} compact={compact} fill={fill} />
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
          stretch ? "flex h-full flex-col p-2 sm:p-3 md:p-4" : dense ? "h-full p-1.5 sm:p-2" : "h-full p-4 sm:p-6 md:p-7"
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
    "min-h-0 overflow-hidden border bg-white",
    stretch
      ? "flex h-full w-full flex-col rounded-lg border-[#D9D4C7] bg-white shadow-sm sm:rounded-xl"
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
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Easner Personal</div>
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
          <div className="mt-1 text-[10px] font-medium text-[#0F1110]">GB82 WEST 1234 5678 9012 34</div>
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
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">Easner tags</div>
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

function DashboardMockup({ assetId: _assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  const activity = ["Invoice paid · $4,800", "Payout sent · $12,400", "Terminal collection · $128"]

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
          <div className="hidden border-r border-[#E9E4D8] bg-[#F8F6F0] p-3 sm:block sm:p-4">
            <div className="mb-4 h-6 w-20 rounded-full bg-[#0F1110] sm:mb-6 sm:h-7 sm:w-24" />
            {["Accounts", "Payouts", "Invoices", "Team"].map((item, index) => (
              <div
                key={item}
                className={cn(
                  "mb-1.5 rounded-xl px-2.5 py-1.5 text-[11px] sm:mb-2 sm:px-3 sm:py-2 sm:text-xs",
                  index === 0 ? "bg-[#EAF5FD] text-[#007ACC]" : "text-[#6F756F]"
                )}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex min-h-0 flex-col overflow-hidden p-3 sm:p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F] sm:text-xs">
                  Business overview
                </div>
                <div className="mt-1 text-xl font-semibold text-[#0F1110] sm:mt-2 sm:text-2xl">$184,920.40</div>
              </div>
              {!compact && (
                <div className="hidden rounded-full bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white sm:inline-flex">
                  Get Started
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2">
              {["USD", "EUR", "NGN"].map((currency, index) => (
                <div key={currency} className="rounded-lg border border-[#E9E4D8] bg-[#F8F6F0] p-2 sm:rounded-xl sm:p-2.5">
                  <div className="text-[9px] text-[#6F756F] sm:text-[10px]">{currency}</div>
                  <div className="mt-1 h-2 w-10 rounded-full bg-[#0F1110] sm:mt-1.5 sm:h-2.5 sm:w-14" />
                  <div className={cn("mt-2 h-1 rounded-full sm:mt-3", index === 0 ? "bg-[#007ACC]" : "bg-[#D9D4C7]")} />
                </div>
              ))}
            </div>
            <div className="mt-3 min-h-0 flex-1 overflow-hidden sm:mt-4">
              <div className="mb-2 text-[10px] font-semibold text-[#0F1110] sm:mb-3 sm:text-xs">Recent activity</div>
              <div className="space-y-1.5 sm:space-y-2">
                {(compact ? activity.slice(0, 2) : activity).map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className={cn("h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5", index === 0 ? "text-[#0F8A5F]" : "text-[#007ACC]")} />
                    <span className="truncate text-[10px] text-[#6F756F] sm:text-[11px]">{item}</span>
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

function BusinessMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("accounts")) {
    return <BusinessAccountsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("send")) {
    return <BusinessSendMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("collections")) {
    return <BusinessCollectionsMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("team")) {
    return <BusinessTeamMockup compact={compact} fill={fill} />
  }
  return <BusinessAccountsMockup compact={compact} fill={fill} />
}

function BusinessAccountsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const accounts = [
    { code: "USD" as const, balance: "$84,220.40", detail: "Virtual account ·••• 9012" },
    { code: "EUR" as const, balance: "€62,180.00", detail: "Virtual account ·••• 4451" },
    { code: "NGN" as const, balance: "₦18,420,000", detail: "Local account ·••• 1188" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "rounded-3xl border-[#E4DED1] p-4")}>
        <div className="rounded-2xl bg-[#0F1110] p-4 text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Total balance</div>
          <div className="mt-1 text-xl font-semibold">$184,920.40</div>
          <div className="mt-1 text-[10px] text-white/45">USD, EUR, and NGN</div>
        </div>
        <div className="mt-3 space-y-2">
          {(compact ? accounts.slice(0, 2) : accounts).map((account, index) => (
            <div
              key={account.code}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3",
                index === 0 ? "border-[#BFE3FA] bg-[#EAF5FD]" : "border-[#E9E4D8] bg-[#F8F6F0]"
              )}
            >
              <div>
                {account.code === "USD" || account.code === "EUR" ? (
                  <CurrencyBadge code={account.code} labelClassName="text-xs" />
                ) : (
                  <span className="text-xs font-semibold text-[#0F1110]">{account.code}</span>
                )}
                <div className="mt-1.5 text-sm font-semibold text-[#0F1110]">{account.balance}</div>
                <div className="mt-0.5 text-[10px] text-[#6F756F]">{account.detail}</div>
              </div>
              <Landmark className="h-5 w-5 text-[#007ACC]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BusinessSendMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "rounded-3xl border-[#E4DED1] p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Send payout</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Meridian Supplies Ltd</div>
          </div>
          <Send className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-4 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Amount</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-2xl font-semibold text-[#0F1110]">$12,400</span>
            <CurrencyBadge code="USD" labelClassName="text-xs" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="rounded-full bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">Bank transfer</div>
          <div className="rounded-full bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#6F756F]">Stablecoin</div>
        </div>
        {!compact && (
          <div className="mt-3 space-y-2">
            {[
              { label: "Beneficiary", value: "Meridian Supplies Ltd" },
              { label: "Reference", value: "PO-2026-044" },
            ].map((field) => (
              <div key={field.label} className="rounded-xl border border-[#E9E4D8] bg-white p-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">{field.label}</div>
                <div className="mt-0.5 text-xs font-medium text-[#0F1110]">{field.value}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#EAF5FD] px-3 py-2.5">
          <span className="text-[11px] text-[#0A2540]">Fee shown before confirm</span>
          <div className="rounded-lg bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">Review</div>
        </div>
      </div>
    </div>
  )
}

function BusinessCollectionsMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const channels = [
    {
      icon: ReceiptText,
      label: "Invoicing",
      stat: "8 open",
    },
    {
      icon: SquareTerminal,
      label: "Terminal",
      stat: "$128 ready",
    },
    {
      icon: QrCode,
      label: "QR Pay",
      stat: "Scan to collect",
    },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "rounded-3xl border-[#E4DED1] p-4")}>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Collections hub</div>
        <div className="mt-1 text-lg font-semibold text-[#0F1110]">One dashboard for pay-in</div>
        <div className={cn("mt-4 grid gap-2", compact ? "grid-cols-1" : "grid-cols-3")}>
          {channels.map((channel, index) => (
            <div
              key={channel.label}
              className={cn(
                "flex flex-col rounded-xl border p-3",
                index === 0 ? "border-[#BFE3FA] bg-[#EAF5FD]" : "border-[#E9E4D8] bg-[#F8F6F0]"
              )}
            >
              <channel.icon className={cn("h-5 w-5", index === 0 ? "text-[#007ACC]" : "text-[#6F756F]")} />
              <div className="mt-2 text-xs font-semibold text-[#0F1110]">{channel.label}</div>
              <div className={cn("mt-1 text-[10px] font-medium", index === 0 ? "text-[#007ACC]" : "text-[#6F756F]")}>
                {channel.stat}
              </div>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-4 rounded-xl border border-dashed border-[#D9D4C7] bg-white p-3 text-center text-[11px] text-[#6F756F]">
            All collections reconcile to your business ledger
          </div>
        )}
      </div>
    </div>
  )
}

function BusinessTeamMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const activity = [
    { label: "Payout approved · Amara O.", amount: "-$4,200", tone: "text-[#0F1110]" },
    { label: "Invoice paid · INV-1042", amount: "+$4,800", tone: "text-[#0F8A5F]" },
    { label: "Role updated · View only", amount: "Maya R.", tone: "text-[#6F756F]" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "rounded-3xl border-[#E4DED1] p-4")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Reporting</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Finance activity</div>
          </div>
          <Users2 className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-4 flex items-end gap-1.5 h-16">
          {[38, 62, 48, 74, 55, 82].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-md bg-[#007ACC]/75"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {(compact ? activity.slice(0, 2) : activity).map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2.5">
              <span className="text-[11px] text-[#0F1110]">{item.label}</span>
              <span className={cn("text-[11px] font-semibold", item.tone)}>{item.amount}</span>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-3 flex gap-2">
            {["Admin", "Finance", "View only"].map((role, index) => (
              <span
                key={role}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  index === 0 ? "bg-[#0F1110] text-white" : "bg-[#EAF5FD] text-[#007ACC]"
                )}
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
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
    return <StablecoinSendMockup compact={compact} fill={fill} />
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
            <div className="mb-4 h-6 w-20 rounded-full bg-[#0F1110]" />
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

function StablecoinSendMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const steps = [
    { label: "Quote", done: true },
    { label: "Review", done: true },
    { label: "Sign", done: false },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-3" : "rounded-3xl border-[#E4DED1] p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Corridor send</div>
            <div className="mt-1 text-lg font-semibold text-[#0F1110]">Meridian Supplies</div>
          </div>
          <ArrowRightLeft className="h-6 w-6 text-[#007ACC]" />
        </div>
        <div className="mt-3 flex gap-1.5">
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  step.done ? "bg-[#007ACC] text-white" : "border border-[#D9D4C7] bg-white text-[#6F756F]"
                )}
              >
                {step.done ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
              </div>
              <span className={cn("text-[10px] font-medium", step.done ? "text-[#007ACC]" : "text-[#6F756F]")}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-[#0F1110] p-3 text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">Send amount</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-2xl font-semibold">$8,400</span>
            <CurrencyBadge code="USDC" labelClassName="text-xs" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Destination</div>
            <div className="mt-0.5 font-mono text-[11px] text-[#0F1110]">0x4b8c…1f2a · Ethereum</div>
          </div>
          {!compact && (
            <div className="flex items-center justify-between rounded-xl border border-[#E9E4D8] bg-white px-2.5 py-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Network fee</div>
                <div className="mt-0.5 text-xs font-medium text-[#0F1110]">$2.40 est.</div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[#E8F7F0] px-2 py-1 text-[10px] font-semibold text-[#0F8A5F]">
                <Clock3 className="h-3 w-3" />
                12 min left
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#EAF5FD] px-3 py-2.5">
          <span className="text-[11px] font-medium text-[#0A2540]">Review and sign to send</span>
          <div className="rounded-lg bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">Continue</div>
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
    return <InvoiceOverviewMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("bank-payin")) {
    return <InvoiceBankPayinMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("stablecoin-payin")) {
    return <InvoiceStablecoinPayinMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("customers")) {
    return <InvoiceCustomersMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("editor")) {
    return <InvoiceEditorMockup compact={compact} fill={fill} />
  }
  return <InvoicePayinMockup compact={compact} fill={fill} />
}

function InvoiceOverviewMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const invoices = [
    { id: "INV-1042", client: "Meridian Labs", amount: "$4,800", status: "Pending", tone: "text-[#B45309] bg-[#FEF3C7]" },
    { id: "INV-1038", client: "Oakridge Trading", amount: "$2,100", status: "Paid", tone: "text-[#0F8A5F] bg-[#E8F7F0]" },
    { id: "INV-1031", client: "Nova Consultancy", amount: "$6,250", status: "Sent", tone: "text-[#007ACC] bg-[#EAF5FD]" },
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
          <div className="hidden border-r border-[#E9E4D8] bg-[#F8F6F0] p-3 sm:block sm:p-4">
            <div className="mb-4 h-6 w-20 rounded-full bg-[#0F1110] sm:mb-6 sm:h-7 sm:w-24" />
            {["Accounts", "Payouts", "Invoices", "Team"].map((item, index) => (
              <div
                key={item}
                className={cn(
                  "mb-1.5 rounded-xl px-2.5 py-1.5 text-[11px] sm:mb-2 sm:px-3 sm:py-2 sm:text-xs",
                  index === 2 ? "bg-[#EAF5FD] font-semibold text-[#007ACC]" : "text-[#6F756F]"
                )}
              >
                {item}
              </div>
            ))}
          </div>
          <div className={cn("flex min-h-0 flex-col overflow-hidden p-3 sm:p-4", fill && "sm:p-5")}>
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F] sm:text-xs">Invoices</div>
                <div className="mt-1 truncate text-lg font-semibold text-[#0F1110] sm:text-xl">$12,400 outstanding</div>
              </div>
              <div className="shrink-0 rounded-full bg-[#007ACC] px-2.5 py-1 text-[10px] font-semibold text-white sm:px-3 sm:py-1.5 sm:text-xs">
                New invoice
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2">
              {[
                { label: "Open", value: "8" },
                { label: "Paid (30d)", value: "14" },
                { label: "Overdue", value: "1" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-[#E9E4D8] bg-[#F8F6F0] p-2 sm:rounded-xl sm:p-2.5">
                  <div className="text-[9px] text-[#6F756F] sm:text-[10px]">{stat.label}</div>
                  <div className="mt-1 text-xs font-semibold text-[#0F1110] sm:text-sm">{stat.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-hidden sm:mt-4 sm:space-y-2">
              {(compact ? invoices.slice(0, 2) : invoices).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border border-[#E9E4D8] bg-[#F8F6F0] p-2.5 sm:rounded-xl sm:p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-semibold text-[#0F1110] sm:text-xs">{invoice.client}</div>
                    <div className="truncate text-[9px] text-[#6F756F] sm:text-[10px]">{invoice.id}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[11px] font-semibold text-[#0F1110] sm:text-xs">{invoice.amount}</div>
                    <div className={cn("mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:mt-1 sm:px-2 sm:text-[10px]", invoice.tone)}>
                      {invoice.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoiceEditorMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const lineItems = [
    { desc: "Platform integration – Q2", qty: "1", amount: "$3,200" },
    { desc: "Support retainer", qty: "1", amount: "$1,600" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div
        className={cn(
          compact ? "h-full w-full" : "grid h-[88%] w-[92%] gap-4 md:grid-cols-[1fr_0.75fr]"
        )}
      >
        <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">New invoice</div>
              <div className="mt-1 text-lg font-semibold text-[#0F1110]">Meridian Labs Ltd</div>
            </div>
            <div className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#B45309]">Draft</div>
          </div>
          <div className="mt-5 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-[#E9E4D8] pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">
              <span>Description</span>
              <span>Qty</span>
              <span>Amt</span>
            </div>
            {lineItems.map((item) => (
              <div key={item.desc} className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-[#E9E4D8]/60 py-2.5 last:border-0">
                <span className="text-xs text-[#0F1110]">{item.desc}</span>
                <span className="text-xs text-[#6F756F]">{item.qty}</span>
                <span className="text-xs font-semibold text-[#0F1110]">{item.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="text-xs text-[#6F756F]">Due in 14 days · USD</div>
            <div className="text-2xl font-semibold text-[#0F1110]">$4,800.00</div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#F8F6F0] px-3 py-2.5 text-center text-xs font-semibold text-[#6F756F]">Save draft</div>
            <div className="rounded-xl bg-[#007ACC] px-3 py-2.5 text-center text-xs font-semibold text-white">Send invoice</div>
          </div>
        </div>
        {!compact && (
          <div className="hidden rounded-3xl border border-[#E4DED1] bg-[#0F1110] p-5 text-white shadow-xl md:block">
            <ReceiptText className="h-6 w-6 text-[#3AA6F8]" />
            <div className="mt-6 text-lg font-semibold">Branded preview</div>
            <div className="mt-4 space-y-2">
              <Line width="w-full" light />
              <Line width="w-4/5" light muted />
              <Line width="w-3/5" light muted />
            </div>
            <div className="mt-6 rounded-2xl bg-white/10 p-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/50">Payment methods enabled</div>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px]">Bank</span>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px]">Stablecoin</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InvoiceBankPayinMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Pay invoice</div>
            <div className="mt-1 text-xl font-semibold text-[#0F1110]">INV-1042 · $4,800</div>
          </div>
          <Landmark className="h-7 w-7 text-[#007ACC]" />
        </div>
        <div className="mt-5 flex gap-2">
          <div className="rounded-full bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">Bank transfer</div>
          <div className="rounded-full bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#6F756F]">Stablecoin</div>
        </div>
        <div className="mt-5 space-y-3">
          {[
            { label: "Account name", value: "Meridian Labs Ltd" },
            { label: "IBAN", value: "GB82 WEST 1234 5678 9012 34" },
            { label: "Reference", value: "INV-1042" },
          ].map((field) => (
            <div key={field.label} className="rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">{field.label}</div>
              <div className="mt-1 text-xs font-medium text-[#0F1110]">{field.value}</div>
            </div>
          ))}
        </div>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5",
            compact ? "mt-3" : "mt-5 rounded-2xl bg-[#EAF5FD] p-3"
          )}
        >
          {!compact && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#007ACC]" />}
          <CurrencyBadge
            code="USD"
            labelClassName={cn("text-xs", compact ? "text-[#6F756F]" : "text-[#0A2540]")}
          />
          <CurrencyBadge
            code="EUR"
            labelClassName={cn("text-xs", compact ? "text-[#6F756F]" : "text-[#0A2540]")}
          />
          <span className={cn("text-xs", compact ? "text-[#6F756F]" : "text-[#0A2540]")}>
            and other currencies where supported
          </span>
        </div>
      </div>
    </div>
  )
}

function InvoiceStablecoinPayinMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div
        className={cn(
          compact ? "h-full w-full" : "grid h-[88%] w-[92%] gap-4 md:grid-cols-[1fr_0.7fr]"
        )}
      >
        <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Pay invoice</div>
              <div className="mt-1 text-xl font-semibold text-[#0F1110]">INV-1042 · $4,800</div>
            </div>
            <WalletCards className="h-7 w-7 text-[#007ACC]" />
          </div>
          <div className="mt-5 flex gap-2">
            <div className="rounded-full bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#6F756F]">Bank transfer</div>
            <div className="rounded-full bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">Stablecoin</div>
          </div>
          <div className="mt-5 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Deposit address</div>
            <div className="mt-1 font-mono text-[11px] text-[#0F1110]">0x7a2f…9c4b · Ethereum</div>
          </div>
          <div className="mt-3 rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Memo (required)</div>
            <div className="mt-1 text-xs font-medium text-[#0F1110]">INV-1042</div>
          </div>
        </div>
        {!compact && (
          <div className="hidden flex-col items-center justify-center rounded-3xl border border-[#E4DED1] bg-[#0F1110] p-5 shadow-xl md:flex">
            <div className="grid h-28 w-28 grid-cols-5 gap-0.5 rounded-xl bg-white p-2">
              {Array.from({ length: 25 }).map((_, index) => (
                <span
                  key={index}
                  className={cn("rounded-sm", [0, 1, 5, 6, 12, 18, 19, 23, 24].includes(index) ? "bg-[#0F1110]" : "bg-[#0F1110]/20")}
                />
              ))}
            </div>
            <QrCode className="mt-4 h-6 w-6 text-[#3AA6F8]" />
            <div className="mt-2 text-center text-xs text-white/60">Scan to pay</div>
          </div>
        )}
      </div>
    </div>
  )
}

function InvoiceCustomersMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const customers = [
    { name: "Meridian Labs Ltd", email: "ap@meridianlabs.io", last: "INV-1042 · $4,800", ref: "ML-2026" },
    { name: "Oakridge Trading", email: "finance@oakridge.co", last: "INV-1038 · $2,100", ref: "OR-118" },
    { name: "Nova Consultancy", email: "billing@novaconsult.com", last: "INV-1031 · $6,250", ref: "NC-044" },
  ]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Customers</div>
            <div className="mt-1 text-xl font-semibold text-[#0F1110]">Invoice directory</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF5FD] text-[#007ACC]">
            <UserRoundPlus className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-3 py-2.5 text-xs text-[#6F756F]">
          Search customers or payer references…
        </div>
        <div className="mt-4 space-y-2.5">
          {(compact ? customers.slice(0, 2) : customers).map((customer) => (
            <div key={customer.name} className="rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F1110] text-sm font-semibold text-white">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0F1110]">{customer.name}</div>
                    <div className="text-[11px] text-[#6F756F]">{customer.email}</div>
                  </div>
                </div>
                <div className="rounded-full bg-[#EAF5FD] px-2 py-0.5 text-[10px] font-semibold text-[#007ACC]">
                  {customer.ref}
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#6F756F]">
                <ReceiptText className="h-3.5 w-3.5 text-[#007ACC]" />
                Last invoice: {customer.last}
              </div>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#D9D4C7] bg-[#F8F6F0] p-3 text-center text-xs text-[#6F756F]">
            Add customer for faster repeat invoicing
          </div>
        )}
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
  return <ApiHeroMockup compact={compact} fill={fill} />
}

function ApiHeroMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  const rails = ["KYC/KYB", "Accounts", "Pay-in", "Payouts", "Webhooks"]

  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div className={cn(mockupPanelClass(compact, true, fill), "overflow-hidden bg-[#0F1110] p-0 text-white")}>
        <div className="flex h-8 shrink-0 items-center gap-2 border-b border-white/10 px-3 sm:h-10 sm:px-4">
          <Code2 className="h-3.5 w-3.5 text-[#3AA6F8] sm:h-4 sm:w-4" />
          <span className="truncate text-[10px] font-medium text-white/60 sm:text-xs">api.easner.com</span>
          <div className="ml-auto hidden rounded-full bg-[#0F8A5F]/20 px-2 py-0.5 text-[9px] font-semibold text-[#7FE0B8] min-[430px]:inline-flex sm:px-2.5 sm:text-[10px]">
            verification.status: approved
          </div>
        </div>
        <div className={cn("grid min-h-0 flex-1 gap-3", fill ? "grid-cols-1 p-2.5 sm:grid-cols-[1.1fr_0.9fr] sm:gap-4 sm:p-4 md:p-5" : compact ? "p-3" : "p-4 sm:grid-cols-[1.1fr_0.9fr] sm:p-5")}>
          <div className="min-h-0 overflow-hidden font-mono text-[10px] leading-5 text-white/85 min-[430px]:text-[11px] sm:text-xs sm:leading-6">
            <div>
              <span className="text-[#3AA6F8]">POST</span> /v1/customers
            </div>
            <div className="mt-2 text-white/35">Authorization: Bearer sk_live_…</div>
            <div className="mt-3 text-white/35">{"{"}</div>
            <div className="pl-4">
              <span className="text-[#7DD3FC]">&quot;type&quot;</span>: &quot;business&quot;,
            </div>
            <div className="pl-4">
              <span className="text-[#7DD3FC]">&quot;external_id&quot;</span>: &quot;org_1284&quot;,
            </div>
            <div className="pl-4">
              <span className="text-[#7DD3FC]">&quot;compliance&quot;</span>: &quot;required&quot;
            </div>
            <div className="text-white/35">{"}"}</div>
          </div>
          <div className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Embedded rails</div>
            <div className="mt-3 space-y-2">
              {rails.map((item, index) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-2.5 py-2">
                  <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", index === 0 ? "text-[#0F8A5F]" : "text-[#3AA6F8]")} />
                  <span className="text-[11px] font-medium text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
          <span className="text-[10px] font-semibold text-white/80">POST /v1/customers</span>
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
          <div className="mt-1 text-xs font-medium text-[#0F1110]">GB82 WEST 1234 5678 9012 34</div>
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
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F756F]">POST /v1/payouts/quote</div>
            <div className="mt-1 text-sm font-semibold text-[#0F1110]">FX quote response</div>
          </div>
          <ArrowRightLeft className="h-5 w-5 text-[#007ACC]" />
        </div>
        <div className="mt-3 rounded-2xl bg-[#0F1110] p-3 font-mono text-[11px] leading-6 text-white/85">
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
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#EAF5FD] px-3 py-2.5">
          <span className="text-[11px] font-medium text-[#0A2540]">Quote reserved · 12 min</span>
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
            https://api.yourapp.com/easner/webhooks
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

function CardMockup({ assetId, compact, fill = false }: { assetId: string; compact: boolean; fill?: boolean }) {
  if (assetId.includes("hero-cards")) {
    return <CardHeroMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("issue")) {
    return <CardIssueMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("cardholders")) {
    return <CardholdersMockup compact={compact} fill={fill} />
  }
  if (assetId.includes("reporting")) {
    return <CardReportingMockup compact={compact} fill={fill} />
  }
  return <CardControlsMockup compact={compact} fill={fill} />
}

function CardHeroMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
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
            <div className="mb-4 h-6 w-20 rounded-full bg-[#0F1110]" />
            {["Accounts", "Payouts", "Cards", "Team"].map((item, index) => (
              <div
                key={item}
                className={cn(
                  "mb-1.5 rounded-xl px-2.5 py-2 text-[11px]",
                  index === 2 ? "bg-[#EAF5FD] font-semibold text-[#007ACC]" : "text-[#6F756F]"
                )}
              >
                {item}
              </div>
            ))}
          </div>
          <div className={cn("flex min-h-0 flex-col justify-center p-3 sm:p-5", fill && "overflow-hidden")}>
            <div className="mb-3 sm:mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Your cards</div>
              <div className="mt-1 text-base font-semibold text-[#0F1110] sm:text-lg">Virtual and physical</div>
            </div>
            <div
              className={cn(
                "relative mx-auto grid w-full min-h-0 flex-1 gap-2 sm:max-w-md sm:gap-4",
                fill && !compact ? "grid-cols-2" : compact ? "grid-cols-1 gap-3" : "grid-cols-2 gap-3"
              )}
            >
              {/* Virtual card */}
              <div
                className={cn(
                  "relative flex min-h-[7.25rem] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-[#007ACC] via-[#0062A3] to-[#0A2540] p-2.5 text-white shadow-[0_16px_40px_rgba(0,122,204,0.28)] sm:min-h-0 sm:rounded-[1.25rem] sm:p-4",
                  !compact && "md:-rotate-2 md:translate-y-1"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55 sm:text-[10px]">
                      Virtual
                    </div>
                    <div className="mt-1 text-sm font-semibold sm:text-base">Easner</div>
                  </div>
                  <div className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-medium text-white/85 sm:text-[10px]">
                    Active
                  </div>
                </div>
                <div className="mt-4 sm:mt-6">
                  <div className="font-mono text-xs tracking-[0.18em] text-white/90 sm:text-sm">•••• •••• •••• 9041</div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.14em] text-white/45 sm:text-[10px]">Cardholder</div>
                      <div className="text-[11px] font-medium text-white/90 sm:text-xs">Amara O.</div>
                    </div>
                    <WalletCards className="h-5 w-5 shrink-0 text-white/70 sm:h-6 sm:w-6" />
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              </div>

              {/* Physical card */}
              <div
                className={cn(
                  "relative flex min-h-[7.5rem] flex-col justify-between overflow-hidden rounded-xl border border-[#2A2D2C] bg-[#0F1110] p-2.5 text-white shadow-[0_16px_40px_rgba(15,17,16,0.35)] sm:min-h-0 sm:rounded-[1.25rem] sm:p-4",
                  !compact && "md:rotate-2 md:-translate-y-1"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 sm:text-[10px]">
                      Physical
                    </div>
                    <div className="mt-1 text-sm font-semibold sm:text-base">Easner</div>
                  </div>
                  <div className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/75 sm:text-[10px]">
                    Shipped
                  </div>
                </div>
                <div className="mt-4 sm:mt-6">
                  <div className="font-mono text-xs tracking-[0.18em] text-white/80 sm:text-sm">•••• •••• •••• 4829</div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.14em] text-white/40 sm:text-[10px]">Expires</div>
                      <div className="text-[11px] font-medium text-white/85 sm:text-xs">09/28</div>
                    </div>
                    <CreditCard className="h-5 w-5 shrink-0 text-white/55 sm:h-6 sm:w-6" />
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-[#007ACC]/20 blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardIssueMockup({ compact, fill = false }: { compact: boolean; fill?: boolean }) {
  return (
    <div className={mockupOuterClass(compact, fill)}>
      <div
        className={cn(
          compact ? "h-full w-full" : "grid h-[88%] w-[92%] gap-4 md:grid-cols-[1fr_0.72fr]"
        )}
      >
        <div className={cn(mockupPanelClass(compact, false, fill), compact ? "p-4" : "rounded-3xl border-[#E4DED1] p-5")}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F756F]">Issue card</div>
              <div className="mt-1 text-lg font-semibold text-[#0F1110]">New cardholder card</div>
            </div>
            <WalletCards className="h-6 w-6 text-[#007ACC]" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="rounded-full bg-[#007ACC] px-3 py-1.5 text-xs font-semibold text-white">Virtual</div>
            <div className="rounded-full bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#6F756F]">Physical</div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Cardholder</div>
              <div className="mt-1 text-xs font-medium text-[#0F1110]">Amara O. · Engineering</div>
            </div>
            <div className="rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Monthly limit</div>
              <div className="mt-1 text-xs font-medium text-[#0F1110]">$2,500 · Software vendors policy</div>
            </div>
            <div className="rounded-2xl border border-[#E9E4D8] bg-[#F8F6F0] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F756F]">Delivery</div>
              <div className="mt-1 text-xs font-medium text-[#0F1110]">Instant · virtual card ready on issue</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#F8F6F0] px-3 py-2.5 text-center text-xs font-semibold text-[#6F756F]">Cancel</div>
            <div className="rounded-xl bg-[#007ACC] px-3 py-2.5 text-center text-xs font-semibold text-white">Issue card</div>
          </div>
        </div>
        {!compact && (
          <div className="hidden rounded-3xl bg-gradient-to-br from-[#007ACC] to-[#0A2540] p-5 text-white shadow-xl md:flex md:flex-col md:justify-between">
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">Preview</div>
            <div>
              <div className="text-lg font-semibold">Virtual card</div>
              <div className="mt-8 flex items-center justify-between text-sm text-white/70">
                <span>•••• 9041</span>
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <div className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/80 w-fit">Ready on issue</div>
          </div>
        )}
      </div>
    </div>
  )
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
          <div className="rounded-full bg-[#EAF5FD] px-3 py-1 text-xs font-semibold text-[#0A2540]">4 active</div>
        </div>
        <div className="mt-4 space-y-3">
          {(compact ? policies.slice(0, 3) : policies).map((policy) => (
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
          {(compact ? activity.slice(0, 3) : activity).map((item) => (
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
