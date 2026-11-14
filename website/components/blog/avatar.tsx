import Image from "next/image"
import { avatarTint, initials } from "@/lib/blog/format"
import { mediaUrl } from "@/lib/blog/urls"
import type { BlogAuthor } from "@/lib/blog/types"
import { cn } from "@/lib/utils"

const TINT: Record<ReturnType<typeof avatarTint>, string> = {
  navy: "bg-brand-navy",
  primary: "bg-brand-primary",
  slate: "bg-brand-slate",
  emerald: "bg-brand-emerald-deep",
}

/** An author's photo (round), or their initials on a brand colour. `size` is the pixel diameter. */
export function Avatar({ author, size = 28, className }: { author: Pick<BlogAuthor, "name" | "avatarPath" | "slug">; size?: number; className?: string }) {
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.32)) }
  if (author.avatarPath) {
    const src = mediaUrl(author.avatarPath)
    return (
      <Image
        src={src}
        alt=""
        width={size * 2}
        height={size * 2}
        unoptimized={src.startsWith("/")}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn("inline-grid shrink-0 place-items-center rounded-full font-semibold leading-none text-primary-foreground", TINT[avatarTint(author.slug)], className)}
      style={style}
    >
      {initials(author.name)}
    </span>
  )
}
