import { Badge } from "@/components/ui/badge"

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  open: { label: "Unpaid", variant: "default" },
  sent: { label: "Sent", variant: "secondary" },
  past_due: { label: "Past due", variant: "destructive" },
  paid: { label: "Paid", variant: "default" },
  void: { label: "Void", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
  archived: { label: "Archived", variant: "secondary" },
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, variant: "secondary" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
