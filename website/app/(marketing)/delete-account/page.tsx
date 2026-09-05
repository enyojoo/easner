import { DeleteAccountPage } from "@/components/legal/delete-account-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Delete Your Account",
    description:
      "How to delete your Easner Personal Banking account, what happens during the 7-day grace period, and what data we delete or retain after closure.",
  },
  path: "/delete-account",
})

export default function DeleteAccountRoute() {
  return <DeleteAccountPage />
}
