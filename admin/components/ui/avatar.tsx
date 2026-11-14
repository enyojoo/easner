"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/** Avatar sizes: `sm` 32, `md` 40, `lg` 56. */
export type AvatarSize = "sm" | "md" | "lg"

const AVATAR_SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
}

/** Initials from the first and last word of a name ("Ada Mensah" → "AM", "Ada" → "A"). */
export function avatarInitials(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ""
  const first = Array.from(words[0])[0] ?? ""
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : ""
  return `${first}${last}`.toUpperCase()
}

type AvatarRootProps = React.ComponentProps<typeof AvatarPrimitive.Root>

export type AvatarProps = AvatarRootProps & {
  /**
   * The person's or business's name. With `name` the Avatar draws itself: the photo from `src`,
   * otherwise initials (first and last word) on `muted` with a hairline ring. It is also the
   * accessible label. Without `name` it is the bare Radix root for `AvatarImage` / `AvatarFallback`.
   */
  name?: string | null
  /** Photo or logo URL; initials show while it loads or when it fails. */
  src?: string | null
  /** `sm` 32 · `md` 40 (default) · `lg` 56. */
  size?: AvatarSize
  /** Hide from assistive tech when the name is written beside the avatar. */
  decorative?: boolean
}

/**
 * Easner avatar: one circle for people and businesses.
 * `<Avatar name="Ada Mensah" src={url} size="md" />`
 */
function Avatar({ className, name, src, size, decorative, children, ...props }: AvatarProps) {
  if (name === undefined) {
    return (
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/60",
          size ? AVATAR_SIZE_CLASS[size] : "size-10",
          className,
        )}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
    )
  }

  const label = (name ?? "").trim()
  const initials = avatarInitials(label)
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label || undefined}
      aria-hidden={decorative || undefined}
      className={cn(
        "relative flex shrink-0 select-none overflow-hidden rounded-full bg-muted font-semibold tracking-[-0.01em] text-foreground ring-1 ring-border/60",
        AVATAR_SIZE_CLASS[size ?? "md"],
        className,
      )}
      {...props}
    >
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className="flex size-full items-center justify-center rounded-full"
      >
        {initials || "?"}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
