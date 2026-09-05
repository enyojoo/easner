import { ArrowDownLeft, ArrowUpRight, CircleCheck, FileText, Landmark, MoreHorizontal, Send, Users2 } from "lucide-react"
import { CurrencyBadge } from "./currency-badge"
import { cn } from "@/lib/utils"

/** Fictional account records for marketing illustrations, never live quotes or balances. */
const businessActivity = [
  { name: "Northstar Studio", detail: "Invoice INV-1042", amount: "+$4,800.00", status: "Received", incoming: true },
  { name: "Meridian Supplies", detail: "Supplier payment", amount: "−$12,400.00", status: "Sent", incoming: false },
  { name: "Amara Okafor", detail: "Contractor payment", amount: "−$1,200.00", status: "Sent", incoming: false },
]

export function PaymentStatus({ children }: { children: string }) {
  return <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#ECF7F1] px-2 py-1 text-[10px] font-medium text-[#176342]"><CircleCheck aria-hidden="true" className="size-3" />{children}</span>
}

export function BusinessDashboardMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="@container flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-[#DCE2E5] bg-white shadow-[0_8px_28px_rgba(15,17,16,0.06)]">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[#E8ECEE] bg-[#FAFBFC] px-4">
        <div aria-hidden="true" className="flex gap-1.5"><span className="size-1.5 rounded-full bg-[#C9D1D8]" /><span className="size-1.5 rounded-full bg-[#C9D1D8]" /><span className="size-1.5 rounded-full bg-[#C9D1D8]" /></div>
        <span className="ml-1 text-[11px] font-medium text-[#54616D]">Easner Business</span>
        <span className="ml-auto text-[10px] text-[#66727D]">Illustrative account</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-36 shrink-0 flex-col border-r border-[#E8ECEE] bg-[#FAFBFC] p-3 @[580px]:flex">
          <div className="px-2 pb-5 pt-1 text-lg font-bold tracking-tight text-[#007ACC]">Easner</div>
          {[{ label: "Accounts", icon: Landmark }, { label: "Payments", icon: Send }, { label: "Invoices", icon: FileText }, { label: "Team", icon: Users2 }].map(({ label, icon: Icon }, index) => (
            <div key={label} className={cn("mb-1 flex items-center gap-2 rounded-lg px-2 py-2.5 text-[11px]", index === 0 ? "bg-[#EAF5FD] font-semibold text-[#0064A8]" : "text-[#63717B]")}><Icon className="size-3.5" aria-hidden="true" />{label}</div>
          ))}
          <div className="mt-auto flex items-center gap-2 border-t border-[#E8ECEE] pt-3 text-[10px] text-[#54616D]"><span className="flex size-7 items-center justify-center rounded-full bg-[#E9EDF0] font-semibold">OS</span>Oakridge Studio</div>
        </div>
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col p-3 @[450px]:p-5", compact && "!p-3")}>
          <div className="flex items-center justify-between gap-2">
            <div><p className="text-[10px] font-medium text-[#63717B]">Oakridge Studio</p><p className="mt-0.5 text-lg font-semibold tracking-tight text-[#152A38] @[450px]:text-xl">Your accounts</p></div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#007ACC] px-3 py-2 text-[11px] font-semibold text-white"><ArrowUpRight className="size-3.5" aria-hidden="true" />Send money</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 @[450px]:gap-3">
            {[{ code: "USD" as const, amount: "$84,220.40", detail: "US dollar" }, { code: "EUR" as const, amount: "€62,180.00", detail: "Euro" }].map(({ code, amount, detail }, index) => (
              <div key={code} className={cn("min-w-0 rounded-xl border p-3", index === 0 ? "border-[#C8E3F6] bg-[#F0F8FE]" : "border-[#E3E8EB] bg-[#FAFBFC]")}>
                <div className="flex items-center justify-between"><CurrencyBadge code={code} labelClassName="text-[11px]" /><MoreHorizontal className="size-3 text-[#63717B]" aria-hidden="true" /></div>
                <div className="mt-2 text-base font-semibold tracking-tight text-[#152A38] tabular-nums @[450px]:text-xl">{amount}</div>
                <div className="mt-1 text-[10px] text-[#63717B]">{detail} balance</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px]"><span className="font-semibold text-[#152A38]">Recent activity</span><span className="text-[#0064A8]">All payments</span></div>
          <div className="mt-1 divide-y divide-[#EDF0F2]">
            {businessActivity.slice(0, compact ? 2 : 3).map((payment) => (
              <div key={payment.name} className="flex items-center gap-2 py-2.5 @[450px]:gap-3">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", payment.incoming ? "bg-[#ECF7F1] text-[#176342]" : "bg-[#EEF4FA] text-[#0064A8]")}>{payment.incoming ? <ArrowDownLeft className="size-3.5" aria-hidden="true" /> : <ArrowUpRight className="size-3.5" aria-hidden="true" />}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium text-[#152A38]">{payment.name}</p><p className="mt-0.5 text-[10px] text-[#63717B]">{payment.detail}</p></div>
                <div className="text-right"><p className="text-[11px] font-semibold text-[#152A38] tabular-nums">{payment.amount}</p><p className="mt-0.5 text-[10px] text-[#176342]">{payment.status}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HomeDashboardMockup() {
  return (
    <div className="h-full min-h-0 p-3 sm:p-5 lg:p-6" role="img" aria-label="Illustrative Easner dashboard with currency balances, an incoming invoice payment, and a supplier payment.">
      <BusinessDashboardMockup compact />
    </div>
  )
}
