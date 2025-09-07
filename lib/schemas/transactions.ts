import { z } from "zod"

export const createTransactionSchema = z.object({
  recipientId: z.string().min(1, "recipientId is required"),
  sendAmount: z.number().positive("sendAmount must be > 0"),
  sendCurrency: z.string().length(3, "sendCurrency must be a 3-letter code"),
  receiveCurrency: z.string().length(3, "receiveCurrency must be a 3-letter code"),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

