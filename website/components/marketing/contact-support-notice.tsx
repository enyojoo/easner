import { MessageCircle } from "lucide-react"
import { SupportChatTrigger } from "@/components/marketing/support-chat-trigger"
import { MarketingLink } from "@/components/marketing/marketing-link"
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
          <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <SupportChatTrigger className="w-full sm:w-auto" analyticsLocation="contact_support_chat">
              {contactSupport.chatLabel}
            </SupportChatTrigger>
            <p className="text-sm leading-6 text-[#6F756F] sm:text-base">
              {contactSupport.emailPreface}{" "}
              <MarketingLink
                href={`mailto:${SUPPORT_EMAIL}`}
                analyticsLocation="contact_support_email"
                ctaLabel={SUPPORT_EMAIL}
                className="break-all font-semibold text-[#007ACC] hover:underline sm:break-normal"
              >
                {SUPPORT_EMAIL}
              </MarketingLink>
            </p>
          </div>
          <p className="mt-3 text-pretty text-xs leading-5 text-[#6F756F] sm:text-sm sm:leading-6">
            {contactSupport.alsoAvailable}
          </p>
        </div>
      </div>
    </div>
  )
}
