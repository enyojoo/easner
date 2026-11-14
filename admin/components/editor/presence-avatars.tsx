"use client"

import { Avatar } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { fileUrl } from "@/components/editor/cover-field"
import type { PresenceViewer } from "@/components/editor/types"
import { cn } from "@/lib/utils"

const MAX_SHOWN = 4

/** Who is on the post right now, in the top bar. The person editing has a ring; hover for names. */
export function PresenceAvatars({ viewers, meId }: { viewers: PresenceViewer[]; meId: string }) {
  const others = viewers.filter((viewer) => viewer.user_id !== meId)
  if (!others.length) return null
  const shown = others.slice(0, MAX_SHOWN)
  const rest = others.length - shown.length
  return (
    <div className="flex items-center" role="group" aria-label={`${others.length} other ${others.length === 1 ? "person" : "people"} on this post`}>
      <div className="flex -space-x-2">
        {shown.map((viewer) => (
          <Tooltip key={viewer.user_id}>
            <TooltipTrigger asChild>
              <span className={cn("rounded-full ring-2", viewer.holds_lock ? "ring-primary" : "ring-background")}>
                <Avatar name={viewer.name} src={fileUrl(viewer.avatar_path)} size="sm" decorative={false} />
              </span>
            </TooltipTrigger>
            <TooltipContent>{viewer.holds_lock ? `${viewer.name} is editing` : `${viewer.name} is reading`}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      {rest > 0 ? <span className="ml-2 text-xs font-medium text-muted-foreground">+{rest}</span> : null}
    </div>
  )
}
