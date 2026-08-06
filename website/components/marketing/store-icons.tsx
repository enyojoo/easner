import { cn } from "@/lib/utils"

/** Apple logo — glyph sits smaller in 24×24 viewBox; sized up for visual parity with Play. */
export function AppleStoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-[1.45rem] shrink-0", className)}
      fill="currentColor"
    >
      <path d="M16.365 1.43c0 1.14-.493 2.096-1.316 2.915-.862.858-1.874 1.338-3.042 1.257-.126-1.106.413-2.14 1.122-2.886.862-.905 2.003-1.456 3.236-1.286zm1.37 4.968c-1.874-.108-3.465 1.066-4.356 1.066-.911 0-2.316-1.044-3.806-.998-1.96.042-3.765 1.14-4.773 2.902-2.037 3.534-.522 8.765 1.463 11.634 1.002 1.445 2.195 3.066 3.764 3.008 1.516-.063 2.086-.98 3.915-.98 1.829 0 2.336.98 3.915.95 1.618-.027 2.64-1.47 3.63-2.924 1.145-1.674 1.616-3.296 1.644-3.378-.036-.016-3.158-1.212-3.186-4.81-.021-3.012 2.465-4.45 2.577-4.522-1.403-2.055-3.587-2.334-4.353-2.376z" />
    </svg>
  )
}

/** Google Play triangle — matched height to AppleStoreIcon. */
export function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28.99 31.99"
      aria-hidden
      className={cn("h-[1.35rem] w-[1.2rem] shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="#EA4335" d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z" />
      <path
        fill="#FBBC04"
        d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.54 3.54 0 0 0 1.5-4.79 3.62 3.62 0 0 0-1.5-1.5z"
      />
      <path fill="#4285F4" d="M.12 2.66a3.57 3.57 0 0 0-.12.92v24.84a3.57 3.57 0 0 0 .12.92L14 15.64Z" />
      <path
        fill="#34A853"
        d="m13.64 16 6.94-6.85L5.5.51A3.73 3.73 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z"
      />
    </svg>
  )
}

/** Paired store icons for Download the App CTAs — equal visual weight. */
export function StoreBadgeIcons({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex h-[1.45rem] items-center gap-1", className)}
      aria-hidden
    >
      <AppleStoreIcon />
      <PlayStoreIcon />
    </span>
  )
}

export function AndroidStoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-6 shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#3DDC84"
        d="M17.6 9.48l1.84-3.18a.5.5 0 0 0-.18-.68.5.5 0 0 0-.68.18l-1.87 3.24a7.02 7.02 0 0 0-7.42 0L6.32 5.8a.5.5 0 0 0-.68-.18.5.5 0 0 0-.18.68L7.4 9.48A6.97 6.97 0 0 0 4 14.5h16a6.97 6.97 0 0 0-3.4-5.02zM8.5 13.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm7 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"
      />
      <path
        fill="#3DDC84"
        d="M4 15.5v2.75A2.75 2.75 0 0 0 6.75 21h.5v2.25a1.25 1.25 0 0 0 2.5 0V21h4.5v2.25a1.25 1.25 0 0 0 2.5 0V21h.5A2.75 2.75 0 0 0 20 18.25V15.5H4z"
      />
    </svg>
  )
}
