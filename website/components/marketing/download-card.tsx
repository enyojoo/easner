import { PersonalBankingCtas } from "./personal-banking-ctas"
import { DownloadEmailForm } from "./download-email-form"
import { DownloadQr } from "./download-qr"
import { SupportChatTrigger } from "./support-chat-trigger"
import { downloadCard, downloadSupport } from "@/lib/marketing/content/download"

export function DownloadCard() {
  return (
    <section className="bg-web-band pb-12 pt-0 sm:pb-16 md:pb-24">
      <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-web-hairline bg-white/85 px-4 py-8 text-center shadow-panel backdrop-blur sm:rounded-[2rem] sm:px-10 sm:py-10 md:py-14">
          <p className="text-sm font-medium text-web-meta sm:text-[15px]">{downloadCard.qrLabel}</p>
          <div className="mt-4 flex justify-center sm:mt-5">
            <DownloadQr size={188} />
          </div>
          <p className="mt-6 text-[13px] leading-5 text-web-meta sm:text-sm">
            {downloadCard.emailDivider}
          </p>
          <div className="mx-auto mt-3 w-full max-w-md">
            <DownloadEmailForm src="download-page" analyticsLocation="download_page_email" />
          </div>
          <div className="mt-6 flex justify-center">
            <PersonalBankingCtas surface="download-page" align="center" webAppOnly />
          </div>
        </div>

        <div className="rounded-[16px] border border-web-hairline bg-web-plate p-4 sm:rounded-[1.75rem] sm:p-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-balance font-display text-base font-bold text-web-ink sm:text-lg md:text-xl">
              {downloadSupport.headline}
            </h2>
            <p className="mt-2 text-pretty text-sm leading-6 text-web-body sm:text-base sm:leading-7">
              {downloadSupport.body}
            </p>
            <div className="mt-4 sm:mt-5">
              <SupportChatTrigger className="w-full sm:w-auto" analyticsLocation="download_page_support_chat">
                {downloadSupport.chatLabel}
              </SupportChatTrigger>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
