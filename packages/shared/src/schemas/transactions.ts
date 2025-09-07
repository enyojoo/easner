import { z } from "zod"

export const createTransactionSchema = z.object({
  recipientId: z.string().min(1),
  sendAmount: z.number().positive(),
  sendCurrency: z.string().length(3),
  receiveCurrency: z.string().length(3),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

