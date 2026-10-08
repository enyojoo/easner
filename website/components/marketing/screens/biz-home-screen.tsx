/**
 * Easner Business Home (design system: BizHome), at native product size (1200 × 820).
 * Total balance with actions, money in and out, recent activity.
 */
import { CalendarDays, CreditCard, EyeOff, FileText, Plus, Send, TrendingDown, TrendingUp } from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { DEMO_BUSINESS } from "@/lib/marketing/demo-data"
import { cn } from "@/lib/utils"
import { BizShell, MoneyRow, PButton, PCard } from "./web-parts"

export const BIZ_HOME_SIZE = { width: 1200, height: 820 }

export function BizHomeScreen({ rows = 5 }: { rows?: number }) {
  return (
    <BizShell active="Home" width={BIZ_HOME_SIZE.width} height={BIZ_HOME_SIZE.height}>
      <div className="grid content-start gap-6">
        <BalanceCard />
        <section>
          <div className="mb-3 flex items-center justify-between px-0.5">
            <h3 className="text-lg font-semibold">Recent activity</h3>
            <span className="text-sm font-medium">View all</span>
          </div>
          <PCard padded={false} className="overflow-hidden">
            {DEMO_BUSINESS.activity.slice(0, rows).map((row, index) => (
              <div key={row.name}>
                {(index === 0 || index === 3) && (
                  <div
                    className={cn(
                      "border-b border-border/60 bg-muted/60 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
                      index > 0 && "border-t",
                    )}
                  >
                    {index === 0 ? "Today" : "Yesterday"}
                  </div>
                )}
                <MoneyRow
                  date={row.date}
                  name={row.name}
                  detail={row.detail}
                  meta={<span className="inline-block w-36">{row.method}</span>}
                  status={row.status}
                  amount={row.amount}
                  divider={index !== 0 && index !== 3}
                />
              </div>
            ))}
          </PCard>
        </section>
      </div>
    </BizShell>
  )
}

/** The Home balance card: total balance, actions, money in and out. Also used on its own as a fragment. */
export function BalanceCard() {
  return (
    <PCard padded={false}>
      <div className="flex items-start justify-between px-6 pb-6 pt-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Total balance
            <EyeOff className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="mt-1 text-[60px] font-bold leading-none tracking-[-0.025em]">
            <Amount value={DEMO_BUSINESS.totalBalance} cents="always" minor="display" />
          </div>
        </div>
        <div className="flex gap-2">
          <PButton icon={Send} className="rounded-full">
            Send
          </PButton>
          <PButton variant="outline" icon={Plus}>
            Add money
          </PButton>
          <PButton variant="outline" icon={FileText}>
            Create invoice
          </PButton>
          <PButton variant="outline" icon={CreditCard}>
            Cards
          </PButton>
        </div>
      </div>
      <div className="flex items-center gap-10 border-t border-border/60 px-6 py-4">
        <MoneyStat label="Money in" value={DEMO_BUSINESS.moneyIn} Icon={TrendingUp} positive />
        <MoneyStat label="Money out" value={DEMO_BUSINESS.moneyOut} Icon={TrendingDown} />
        <span className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-input/60 px-3.5 text-sm font-medium">
          <CalendarDays className="size-4" strokeWidth={2} aria-hidden="true" />
          30 days
        </span>
      </div>
    </PCard>
  )
}

function MoneyStat({
  label,
  value,
  Icon,
  positive,
}: {
  label: string
  value: number
  Icon: typeof TrendingUp
  positive?: boolean
}) {
  return (
    <span className="flex items-center gap-3">
      <span
        className={cn(
          "grid size-8 place-items-center rounded-full",
          positive ? "bg-surface-tint text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-muted-foreground">{label}</span>
        <span className="block text-base font-semibold">
          <Amount value={value} signed cents="always" minor="large" />
        </span>
      </span>
    </span>
  )
}
