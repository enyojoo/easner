import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { SUPPORT_EMAIL } from "@/lib/marketing/constants"
import { contactSupport } from "@/lib/marketing/content/contact"

export function ContactSupportNotice() {
  return (
    <div
      id={contactSupport.anchor}
      className="scroll-mt-28 rounded-[1.75rem] border border-[#E4DED1] bg-[#F8F6F0] p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#E4DED1] bg-white text-[#007ACC]">
          <MessageCircle className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h2 className="font-unbounded text-lg font-semibold text-[#0F1110] sm:text-xl">
            {contactSupport.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#5F665F] sm:text-base">{contactSupport.body}</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5F665F] sm:text-base">
            <li>
              <strong className="text-[#0F1110]">{contactSupport.inAppLabel}:</strong> {contactSupport.inAppText}
            </li>
            <li>
              <strong className="text-[#0F1110]">{contactSupport.emailLabel}:</strong>{" "}
              <Link href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#007ACC] hover:underline">
                {SUPPORT_EMAIL}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
