import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { SupportChatTrigger } from "@/components/marketing/support-chat-trigger"
import { SUPPORT_EMAIL } from "@/lib/marketing/constants"
import { contactSupport } from "@/lib/marketing/content/contact"

export function ContactSupportNotice() {
  return (
    <div
      id={contactSupport.anchor}
      className="scroll-mt-24 rounded-2xl border border-[#E4DED1] bg-[#F8F6F0] p-4 sm:scroll-mt-28 sm:rounded-[1.75rem] sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#E4DED1] bg-white text-[#007ACC] sm:size-11">
          <MessageCircle className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-balance font-unbounded text-base font-bold text-[#0F1110] sm:text-lg md:text-xl">
            {contactSupport.headline}
          </h2>
          <p className="mt-2 text-pretty text-sm leading-6 text-[#5F665F] sm:text-base sm:leading-7">
            {contactSupport.body}
          </p>
          <div className="mt-4 sm:mt-5">
            <SupportChatTrigger className="w-full sm:w-auto">{contactSupport.chatLabel}</SupportChatTrigger>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm leading-6 text-[#5F665F] sm:mt-5 sm:space-y-3 sm:text-base sm:leading-7">
            <li className="text-pretty">
              <strong className="text-[#0F1110]">{contactSupport.inAppLabel}:</strong> {contactSupport.inAppText}
            </li>
            <li className="text-pretty">
              <strong className="text-[#0F1110]">{contactSupport.emailLabel}:</strong>{" "}
              <Link
                href={`mailto:${SUPPORT_EMAIL}`}
                className="break-all font-semibold text-[#007ACC] hover:underline sm:break-normal"
              >
                {SUPPORT_EMAIL}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
