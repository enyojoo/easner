// Stellar Transaction Service
import { horizonServer, USDC_ASSET } from "./stellar-config"
import type { Horizon } from "@stellar/stellar-sdk"

export interface StellarPayment {
  id: string
  type: string
  from: string
  to: string
  amount: string
  assetCode: string
  assetIssuer?: string
  transactionHash: string
  createdAt: string
  ledger: number
}

export const stellarTransactionService = {
  /**
   * Monitor account for incoming transactions
   */
  async monitorAccountTransactions(accountId: string, cursor?: string): Promise<StellarPayment[]> {
    try {
      const payments = await horizonServer
        .payments()
        .forAccount(accountId)
        .order("desc")
        .limit(100)
        .cursor(cursor || "now")
        .call()

      const usdcPayments: StellarPayment[] = []

      for (const payment of payments.records) {
        if (payment.type === "payment" && payment.to === accountId) {
          const paymentOp = payment as Horizon.PaymentOperationResponse

          // Check if it's USDC
          if (
            paymentOp.asset_code === USDC_ASSET.code &&
            paymentOp.asset_issuer === USDC_ASSET.issuer
          ) {
            usdcPayments.push({
              id: paymentOp.id,
              type: paymentOp.type,
              from: paymentOp.from,
              to: paymentOp.to,
              amount: paymentOp.amount,
              assetCode: paymentOp.asset_code || "XLM",
              assetIssuer: paymentOp.asset_issuer,
              transactionHash: paymentOp.transaction_hash,
              createdAt: paymentOp.created_at,
              ledger: paymentOp.ledger_attr || 0,
            })
          }
        }
      }

      return usdcPayments
    } catch (error) {
      console.error("Error monitoring account transactions:", error)
      throw error
    }
  },

  /**
   * Get transaction details from Horizon
   */
  async getTransactionDetails(txHash: string): Promise<Horizon.TransactionResponse | null> {
    try {
      const transaction = await horizonServer.transactions().transaction(txHash).call()
      return transaction
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Verify transaction details
   */
  async verifyTransaction(
    txHash: string,
    expectedAmount: string,
    expectedTo: string,
  ): Promise<boolean> {
    const transaction = await this.getTransactionDetails(txHash)

    if (!transaction) {
      return false
    }

    // Check if transaction succeeded
    if (transaction.successful !== true) {
      return false
    }

    // Find payment operation
    for (const operation of transaction.operations) {
      if (operation.type === "payment") {
        const paymentOp = operation as Horizon.PaymentOperationResponse
        if (
          paymentOp.to === expectedTo &&
          paymentOp.amount === expectedAmount &&
          paymentOp.asset_code === USDC_ASSET.code &&
          paymentOp.asset_issuer === USDC_ASSET.issuer
        ) {
          return true
        }
      }
    }

    return false
  },

  /**
   * Get payment history for an account
   */
  async getAccountPayments(accountId: string, limit: number = 100): Promise<StellarPayment[]> {
    try {
      const payments = await horizonServer
        .payments()
        .forAccount(accountId)
        .order("desc")
        .limit(limit)
        .call()

      const usdcPayments: StellarPayment[] = []

      for (const payment of payments.records) {
        if (payment.type === "payment") {
          const paymentOp = payment as Horizon.PaymentOperationResponse

          if (
            paymentOp.asset_code === USDC_ASSET.code &&
            paymentOp.asset_issuer === USDC_ASSET.issuer
          ) {
            usdcPayments.push({
              id: paymentOp.id,
              type: paymentOp.type,
              from: paymentOp.from,
              to: paymentOp.to,
              amount: paymentOp.amount,
              assetCode: paymentOp.asset_code || "XLM",
              assetIssuer: paymentOp.asset_issuer,
              transactionHash: paymentOp.transaction_hash,
              createdAt: paymentOp.created_at,
              ledger: paymentOp.ledger_attr || 0,
            })
          }
        }
      }

      return usdcPayments
    } catch (error) {
      console.error("Error getting account payments:", error)
      throw error
    }
  },

  /**
   * Get latest payment for an account (for monitoring)
   */
  async getLatestPayment(accountId: string): Promise<StellarPayment | null> {
    const payments = await this.getAccountPayments(accountId, 1)
    return payments.length > 0 ? payments[0] : null
  },
}

