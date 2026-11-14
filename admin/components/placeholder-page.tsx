import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"

type PlaceholderPageProps = {
  title: string
  description: string
  icon: LucideIcon
  emptyTitle: string
  emptyMessage: string
}

/** A section whose screens are not built yet: the real header, and one calm EmptyState. */
export function PlaceholderPage({ title, description, icon, emptyTitle, emptyMessage }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card padding="none">
        <EmptyState icon={icon} title={emptyTitle} message={emptyMessage} />
      </Card>
    </div>
  )
}
