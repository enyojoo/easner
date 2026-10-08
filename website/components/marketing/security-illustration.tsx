import { BadgeCheck, LockKeyhole, ScanSearch, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const CHECKS = [
  { Icon: BadgeCheck, label: "Identity verified", position: "left-[5%] top-[9%] sm:left-[8%] sm:top-[12%]" },
  { Icon: ScanSearch, label: "Sanctions screened", position: "right-[5%] top-[19%] sm:right-[7%] sm:top-[24%]" },
  { Icon: LockKeyhole, label: "Payments encrypted", position: "bottom-[9%] left-1/2 -translate-x-1/2 sm:bottom-[11%]" },
]

/**
 * Trust illustration for the verification band: a shield at the centre of concentric rings, with the
 * three checks every account and payment passes. Decorative; the section copy carries the meaning.
 */
export function SecurityIllustration({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="A shield surrounded by the checks Easner runs: identity verified, sanctions screened, payments encrypted"
      className={cn("relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04]", className)}
    >
      <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
        {[92, 72, 52].map((size) => (
          <span key={size} className="absolute rounded-full border border-white/10" style={{ width: `${size}%`, aspectRatio: "1" }} />
        ))}
        <span className="absolute size-[36%] rounded-full bg-[radial-gradient(circle,rgba(0,122,204,0.35),transparent_70%)]" />
        <span className="relative mt-[4%] grid size-20 place-items-center rounded-full bg-brand-primary shadow-lift sm:size-28">
          <ShieldCheck className="size-10 text-white sm:size-14" strokeWidth={1.75} />
        </span>
      </div>
      {CHECKS.map(({ Icon, label, position }) => (
        <span
          key={label}
          aria-hidden="true"
          className={cn(
            "absolute flex items-center gap-2 rounded-full border border-white/15 bg-brand-navy px-3 py-2 text-xs font-semibold text-white shadow-lift sm:px-4 sm:text-sm",
            position,
          )}
        >
          <span className="grid size-6 place-items-center rounded-full bg-success-surface text-success-text">
            <Icon className="size-3.5" strokeWidth={2.25} />
          </span>
          {label}
        </span>
      ))}
    </div>
  )
}
