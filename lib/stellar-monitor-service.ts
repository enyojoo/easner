// Stellar Monitor Service - Monitors wallets for incoming transactions
import { stellarTransactionService } from "./stellar-transaction-service"
import { cryptoWalletService, cryptoReceiveTransactionService } from "./database"
import { circleAnchorService } from "./circle-anchor-service"
import { cryptoReceiveService } from "./crypto-receive-service"

interface MonitoringState {
  lastCheckedCursor: string
  walletId: string
}

export const stellarMonitorService = {
  /**
   * Check a wallet for new incoming transactions
   */
  async checkWalletForTransactions(walletId: string): Promise<void> {
    const wallet = await cryptoWalletService.getById(walletId)

    if (!wallet || wallet.status !== "active") {
      return
    }

    // Get existing transactions for this wallet to avoid duplicates
    const existingTransactions = await cryptoReceiveTransactionService.getByWallet(walletId)
    const existingHashes = new Set(
      existingTransactions.map((tx) => tx.stellar_transaction_hash),
    )

    // Monitor for new payments
    const payments = await stellarTransactionService.monitorAccountTransactions(
      wallet.stellar_account_id,
    )

    for (const payment of payments) {
      // Skip if we already have this transaction
      if (existingHashes.has(payment.transactionHash)) {
        continue
      }

      // Only process incoming USDC payments
      if (payment.to === wallet.stellar_account_id && payment.assetCode === "USDC") {
        // Get exchange rate
        const exchangeRate = await circleAnchorService.getExchangeRate(
          "USDC",
          wallet.fiat_currency,
        )

        const cryptoAmount = parseFloat(payment.amount)
        const fiatAmount = cryptoAmount * exchangeRate

        // Create transaction record
        const transaction = await cryptoReceiveTransactionService.create(
          walletId,
          payment.transactionHash,
          cryptoAmount,
          "USDC",
          fiatAmount,
          wallet.fiat_currency,
          exchangeRate,
          wallet.user_id,
        )

        // Send pending email notification
        try {
          const { EmailNotificationService } = await import("./email-notification-service")
          await EmailNotificationService.sendCryptoReceiveTransactionEmail(
            transaction.transaction_id,
            "pending",
          )
        } catch (emailError) {
          console.error("Failed to send pending email:", emailError)
        }

        // Verify and process the transaction
        await cryptoReceiveService.verifyAndConfirmTransaction(
          transaction.transaction_id,
          payment.transactionHash,
        )
      }
    }
  },

  /**
   * Check all active wallets for new transactions
   */
  async checkAllWallets(): Promise<void> {
    // This would typically be called by a cron job or scheduled task
    const { createServerClient } = await import("./supabase")
    const supabase = createServerClient()

    // Get all active wallets
    const { data: wallets, error } = await supabase
      .from("crypto_wallets")
      .select("id")
      .eq("status", "active")

    if (error) {
      console.error("Error fetching wallets for monitoring:", error)
      return
    }

    // Check each wallet
    for (const wallet of wallets || []) {
      try {
        await this.checkWalletForTransactions(wallet.id)
      } catch (error) {
        console.error(`Error checking wallet ${wallet.id}:`, error)
        // Continue with other wallets
      }
    }
  },

  /**
   * Monitor a specific account by account ID (called periodically)
   */
  async monitorAccount(accountId: string): Promise<void> {
    const { createServerClient } = await import("./supabase")
    const supabase = createServerClient()

    // Find wallet by stellar account ID
    const { data: wallet, error } = await supabase
      .from("crypto_wallets")
      .select("id")
      .eq("stellar_account_id", accountId)
      .eq("status", "active")
      .single()

    if (error || !wallet) {
      console.error(`Wallet not found for account ${accountId}`)
      return
    }

    await this.checkWalletForTransactions(wallet.id)
  },
}

