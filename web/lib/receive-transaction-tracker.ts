// Receive Transaction Tracker
// Tracks transactions from Bridge webhooks (liquidation events and card top-up events)

import { cryptoReceiveTransactionService } from "./database"

interface LiquidationWebhookData {
  id: string
  customer_id: string
  liquidation_address_id: string
  liquidation_id: string
  blockchain_tx_hash: string
  blockchain_memo?: string
  amount: string
  currency: string
  destination_currency: string
  status: string
  created_at: string
  completed_at?: string
}

interface CardTopUpWebhookData {
  id: string
  card_account_id: string
  customer_id: string
  blockchain_tx_hash: string
  amount: string
  currency: string
  status: string
  created_at: string
}

export const receiveTransactionTracker = {
  /**
   * Handle Bridge liquidation webhook (bank payouts)
   */
  async processLiquidationWebhook(
    webhookData: LiquidationWebhookData,
  ): Promise<{ transactionId: string; status: string }> {
    // Find or create receive transaction record
    // The transaction should already exist if we're tracking deposits
    // If not, create a new one

    // For now, we'll create a new transaction record
    // In production, you might want to match by blockchain_tx_hash first
    const transaction = await cryptoReceiveTransactionService.create(
      "", // walletId - this should be looked up from liquidation_address_id
      webhookData.blockchain_tx_hash,
      parseFloat(webhookData.amount),
      webhookData.currency.toLowerCase(),
      parseFloat(webhookData.amount), // fiat amount (same for now, should be converted)
      webhookData.destination_currency,
      1.0, // exchange rate (should be fetched)
      webhookData.customer_id, // userId
      {
        bridge_liquidation_address_id: webhookData.liquidation_address_id,
        bridge_liquidation_id: webhookData.liquidation_id,
        blockchain_memo: webhookData.blockchain_memo,
        external_account_id: webhookData.external_account_id, // This should come from webhook
        destination_type: "bank",
        destination_currency: webhookData.destination_currency,
      },
    )

    // Update transaction status based on liquidation status
    let status = "pending"
    if (webhookData.status === "completed") {
      status = "completed"
    } else if (webhookData.status === "failed") {
      status = "failed"
    } else if (webhookData.status === "processing") {
      status = "processing"
    }

    await cryptoReceiveTransactionService.updateStatus(transaction.transaction_id, status, {
      // Store Bridge-specific fields
      bridge_liquidation_address_id: webhookData.liquidation_address_id,
      bridge_liquidation_id: webhookData.liquidation_id,
      blockchain_tx_hash: webhookData.blockchain_tx_hash,
      blockchain_memo: webhookData.blockchain_memo,
      destination_type: "bank",
      destination_currency: webhookData.destination_currency,
      liquidation_status: webhookData.status,
    })

    return {
      transactionId: transaction.transaction_id,
      status,
    }
  },

  /**
   * Handle Bridge card balance change webhook (card payouts)
   */
  async processCardTopUpWebhook(
    webhookData: CardTopUpWebhookData,
  ): Promise<{ transactionId: string; status: string }> {
    // Find or create receive transaction record for card top-up
    const transaction = await cryptoReceiveTransactionService.create(
      "", // walletId - this should be looked up from card_account_id
      webhookData.blockchain_tx_hash,
      parseFloat(webhookData.amount),
      webhookData.currency.toLowerCase(),
      parseFloat(webhookData.amount), // fiat amount (same for now)
      webhookData.currency.toUpperCase(), // destination currency
      1.0, // exchange rate
      webhookData.customer_id, // userId
      {
        bridge_card_account_id: webhookData.card_account_id,
        destination_type: "card",
        destination_currency: webhookData.currency.toUpperCase(),
      },
    )

    // Update transaction status based on card top-up status
    let status = "pending"
    if (webhookData.status === "funded" || webhookData.status === "completed") {
      status = "completed"
    } else if (webhookData.status === "failed") {
      status = "failed"
    } else if (webhookData.status === "processing") {
      status = "processing"
    }

    await cryptoReceiveTransactionService.updateStatus(transaction.transaction_id, status, {
      // Store Bridge card-specific fields
      bridge_card_account_id: webhookData.card_account_id,
      blockchain_tx_hash: webhookData.blockchain_tx_hash,
      destination_type: "card",
      destination_currency: webhookData.currency.toUpperCase(),
      card_top_up_status: webhookData.status,
    })

    return {
      transactionId: transaction.transaction_id,
      status,
    }
  },

  /**
   * Update transaction status from webhook
   */
  async updateTransactionStatus(
    transactionId: string,
    status: string,
    additionalData?: Record<string, any>,
  ): Promise<void> {
    await cryptoReceiveTransactionService.updateStatus(transactionId, status, additionalData)
  },

  /**
   * Get transaction details from Bridge
   * This would typically fetch additional details from Bridge API
   */
  async getTransactionDetails(
    transactionId: string,
  ): Promise<{
    transactionId: string
    status: string
    amount: number
    currency: string
    blockchainTxHash?: string
  }> {
    const transaction = await cryptoReceiveTransactionService.getByTransactionId(transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`)
    }

    return {
      transactionId: transaction.transaction_id,
      status: transaction.status,
      amount: transaction.crypto_amount,
      currency: transaction.crypto_currency,
      blockchainTxHash: transaction.stellar_transaction_hash || undefined,
    }
  },
}

