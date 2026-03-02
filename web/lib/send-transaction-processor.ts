// Send Transaction Processor
// Handles atomic transaction processing: in → routed → out (stateless)

import { yellowCardService } from "./yellow-card-service"
import { bridgePayoutService } from "./bridge-payout-service"
import { paymentCollectionService } from "./payment-collection-service"
import { transactionService } from "./database"

interface TransactionStatus {
  paymentStatus: "pending" | "received" | "failed"
  payoutStatus: "pending" | "processing" | "completed" | "failed"
  payoutProvider?: "yellow_card" | "bridge"
  payoutId?: string
}

export const sendTransactionProcessor = {
  /**
   * Collect fiat payment from user
   * Once payment received → immediately route to payout (no balance storage)
   */
  async collectPayment(
    transactionId: string,
    customerId: string,
    paymentData: {
      amount: string
      currency: string
      reference?: string
      successUrl?: string
      failureUrl?: string
    },
  ): Promise<{ paymentLinkId: string; paymentUrl: string }> {
    const paymentLink = await paymentCollectionService.createPaymentLink(customerId, {
      amount: paymentData.amount,
      currency: paymentData.currency,
      reference: paymentData.reference || transactionId,
      successUrl: paymentData.successUrl,
      failureUrl: paymentData.failureUrl,
      idempotencyKey: transactionId,
    })

    return {
      paymentLinkId: paymentLink.id,
      paymentUrl: paymentLink.payment_url,
    }
  },

  /**
   * Immediately route to payout provider:
   * - If African currency → Yellow Card disbursement
   * - If USD/EUR → Bridge payout
   */
  async routeToPayout(
    transactionId: string,
    customerId: string,
    payoutData: {
      amount: string
      currency: string
      recipientAccountNumber?: string
      recipientBankName?: string
      recipientName?: string
      externalAccountId?: string
      paymentRail?: "wire" | "ach" | "sepa"
      reference?: string
    },
  ): Promise<{ provider: "yellow_card" | "bridge"; payoutId: string }> {
    const currency = payoutData.currency.toUpperCase()

    // Route based on currency
    if (yellowCardService.isCurrencySupported(currency)) {
      // African currency → Yellow Card
      const disbursement = await yellowCardService.createDisbursement({
        amount: parseFloat(payoutData.amount),
        currency: currency,
        recipientAccountNumber: payoutData.recipientAccountNumber || "",
        recipientBankName: payoutData.recipientBankName,
        recipientName: payoutData.recipientName,
        reference: payoutData.reference || transactionId,
      })

      return {
        provider: "yellow_card",
        payoutId: disbursement.id,
      }
    } else if (["USD", "EUR"].includes(currency)) {
      // USD/EUR → Bridge payout
      if (!payoutData.externalAccountId) {
        throw new Error("externalAccountId is required for Bridge payouts")
      }

      const payout = await bridgePayoutService.createPayout(customerId, {
        externalAccountId: payoutData.externalAccountId,
        amount: payoutData.amount,
        currency: currency,
        paymentRail: payoutData.paymentRail || "wire",
        reference: payoutData.reference || transactionId,
        idempotencyKey: transactionId,
      })

      return {
        provider: "bridge",
        payoutId: payout.id,
      }
    } else {
      throw new Error(`Unsupported currency for payout: ${currency}`)
    }
  },

  /**
   * Update transaction status throughout flow
   */
  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
  ): Promise<void> {
    // Update transaction in database with payment and payout status
    // This would typically update the transactions table with:
    // - payment_collection_provider
    // - payment_link_id
    // - payment_received_at
    // - payout_provider
    // - yellow_card_disbursement_id or bridge_payout_id
    // - payout_status

    // For now, we'll use a placeholder update
    // This should be implemented based on the actual database schema
    console.log(`Updating transaction ${transactionId} with status:`, status)
    
    // TODO: Implement actual database update once schema is updated
    // await transactionService.update(transactionId, {
    //   payment_status: status.paymentStatus,
    //   payout_status: status.payoutStatus,
    //   payout_provider: status.payoutProvider,
    //   payout_id: status.payoutId,
    // })
  },

  /**
   * Check payment status and route to payout if received
   */
  async checkAndRoutePayment(
    transactionId: string,
    paymentLinkId: string,
    customerId: string,
    payoutData: {
      amount: string
      currency: string
      recipientAccountNumber?: string
      recipientBankName?: string
      recipientName?: string
      externalAccountId?: string
      paymentRail?: "wire" | "ach" | "sepa"
    },
  ): Promise<{ routed: boolean; payoutId?: string }> {
    const paymentStatus = await paymentCollectionService.checkPaymentStatus(paymentLinkId)

    if (paymentStatus.status === "paid") {
      // Payment received → immediately route to payout
      const payoutResult = await this.routeToPayout(transactionId, customerId, {
        ...payoutData,
        reference: transactionId,
      })

      await this.updateTransactionStatus(transactionId, {
        paymentStatus: "received",
        payoutStatus: "processing",
        payoutProvider: payoutResult.provider,
        payoutId: payoutResult.payoutId,
      })

      return {
        routed: true,
        payoutId: payoutResult.payoutId,
      }
    }

    return {
      routed: false,
    }
  },
}


