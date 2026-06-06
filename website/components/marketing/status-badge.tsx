import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  label: string
  className?: string
}

export function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#BFE3FA] bg-[#EAF5FD] px-3 py-1 text-xs font-semibold text-[#0A2540]",
        className
      )}
    >
      {label}
    </span>
  )
}
