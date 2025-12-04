// Combined Transaction Service - Merges send and receive transactions
import { transactionService, adminService } from "./database"

export interface CombinedTransaction {
  id: string
  transaction_id: string
  type: "send" | "receive" | "card_funding"
  user_id: string
  status: string
  created_at: string
  updated_at: string
  // User field (for admin views)
  user?: {
    first_name: string
    last_name: string
    email: string
  }
  // Send transaction fields
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  recipient?: any
  // Receive transaction fields
  crypto_amount?: number
  crypto_currency?: string
  fiat_amount?: number
  fiat_currency?: string
  stellar_transaction_hash?: string
  blockchain_tx_hash?: string
  crypto_wallet?: any
  // Card funding fields
  destination_type?: "bank" | "card"
  bridge_card_account_id?: string
}

export const combinedTransactionService = {
  /**
   * Get combined send and receive transactions for a user
   */
  async getUserAllTransactions(
    userId: string,
    filters: {
      type?: "all" | "send" | "receive"
      status?: string
      limit?: number
    } = {},
  ): Promise<CombinedTransaction[]> {
    const limit = filters.limit || 100

    // Fetch send transactions only (crypto_receive_transactions table removed)
    const [sendTransactions, receiveTransactions] = await Promise.all([
      transactionService.getByUserId(userId, limit, userId).catch((error) => {
        console.error("Error fetching send transactions:", error)
        return []
      }),
      // No longer fetching receive transactions
      Promise.resolve([]),
    ])

    console.log("CombinedTransactionService - getUserAllTransactions:", {
      userId,
      sendCount: sendTransactions?.length || 0,
      receiveCount: receiveTransactions?.length || 0,
    })

    // Transform send transactions
    const sendTxns: CombinedTransaction[] = (sendTransactions || []).map((tx) => ({
      id: tx.id,
      transaction_id: tx.transaction_id,
      type: "send" as const,
      user_id: tx.user_id,
      status: tx.status,
      created_at: tx.created_at,
      updated_at: tx.updated_at,
      send_amount: tx.send_amount,
      send_currency: tx.send_currency,
      receive_amount: tx.receive_amount,
      receive_currency: tx.receive_currency,
      recipient: tx.recipient,
    }))

    // Transform receive transactions - distinguish between bank payouts and card funding
    const receiveTxns: CombinedTransaction[] = (receiveTransactions || []).map((tx) => {
      const isCardFunding = tx.destination_type === "card" || tx.bridge_card_account_id
      return {
        id: tx.id,
        transaction_id: tx.transaction_id || tx.id, // Fallback to id if transaction_id is missing
        type: (isCardFunding ? "card_funding" : "receive") as const,
        user_id: tx.user_id,
        status: tx.status,
        created_at: tx.created_at,
        updated_at: tx.updated_at,
        crypto_amount: tx.crypto_amount,
        crypto_currency: tx.crypto_currency,
        fiat_amount: tx.fiat_amount,
        fiat_currency: tx.fiat_currency,
        stellar_transaction_hash: tx.stellar_transaction_hash || tx.blockchain_tx_hash, // Fallback to blockchain_tx_hash
        crypto_wallet: tx.crypto_wallet,
        destination_type: tx.destination_type,
        bridge_card_account_id: tx.bridge_card_account_id,
      }
    })

    // Combine and sort by date (newest first)
    let combined: CombinedTransaction[] = [...sendTxns, ...receiveTxns]

    // Apply type filter
    if (filters.type === "send") {
      combined = sendTxns
    } else if (filters.type === "receive") {
      combined = receiveTxns
    }

    // Apply status filter
    if (filters.status) {
      combined = combined.filter((tx) => tx.status === filters.status)
    }

    // Sort by created_at descending
    combined.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Limit results
    return combined.slice(0, limit)
  },

  /**
   * Get combined send and receive transactions for admin
   */
  async getAdminAllTransactions(
    filters: {
      type?: "all" | "send" | "receive"
      status?: string
      search?: string
      limit?: number
    } = {},
  ): Promise<CombinedTransaction[]> {
    try {
      const limit = filters.limit || 100

      // Fetch send transactions only (crypto_receive_transactions table removed)
      const sendTransactions = await adminService.getAllTransactions({
          status: filters.status,
          search: filters.search,
          limit,
        }).catch((error) => {
          console.error("Error fetching send transactions in getAdminAllTransactions:", error)
          console.error("Error message:", error?.message)
          console.error("Error code:", error?.code)
          console.error("Error details:", error?.details)
          console.error("Error stack:", error?.stack)
              return []
            })

      const receiveTransactions: any[] = [] // No longer fetching receive transactions

      console.log("CombinedTransactionService - getAdminAllTransactions:", {
        filters,
        sendCount: sendTransactions?.length || 0,
        receiveCount: 0,
      })

      // Transform send transactions
      const sendTxns: CombinedTransaction[] = (sendTransactions || [])
      .filter((tx) => tx && tx.id) // Filter out null/undefined transactions
      .map((tx) => ({
        id: tx.id,
        transaction_id: tx.transaction_id || tx.id, // Fallback to id if transaction_id is missing
        type: "send" as const,
        user_id: tx.user_id,
        status: tx.status || "pending",
        created_at: tx.created_at || new Date().toISOString(),
        updated_at: tx.updated_at || tx.created_at || new Date().toISOString(),
        send_amount: tx.send_amount,
        send_currency: tx.send_currency,
        receive_amount: tx.receive_amount,
        receive_currency: tx.receive_currency,
        recipient: tx.recipient,
        user: tx.user,
      }))

      // Transform receive transactions - distinguish between bank payouts and card funding
      const receiveTxns: CombinedTransaction[] = (receiveTransactions || [])
      .filter((tx) => tx && tx.id) // Filter out null/undefined transactions
      .map((tx) => {
        const isCardFunding = tx.destination_type === "card" || tx.bridge_card_account_id
        return {
          id: tx.id,
          transaction_id: tx.transaction_id || tx.id, // Fallback to id if transaction_id is missing
          type: (isCardFunding ? "card_funding" : "receive") as const,
          user_id: tx.user_id,
          status: tx.status || "pending",
          created_at: tx.created_at || new Date().toISOString(),
          updated_at: tx.updated_at || tx.created_at || new Date().toISOString(),
          crypto_amount: tx.crypto_amount,
          crypto_currency: tx.crypto_currency,
          fiat_amount: tx.fiat_amount,
          fiat_currency: tx.fiat_currency,
          stellar_transaction_hash: tx.stellar_transaction_hash || tx.blockchain_tx_hash, // Fallback to blockchain_tx_hash
          crypto_wallet: tx.crypto_wallet,
          user: tx.user,
          destination_type: tx.destination_type,
          bridge_card_account_id: tx.bridge_card_account_id,
        }
      })

      // Combine and sort
      let combined: CombinedTransaction[] = [...sendTxns, ...receiveTxns]

      // Apply type filter
      if (filters.type === "send") {
        combined = sendTxns
      } else if (filters.type === "receive") {
        combined = receiveTxns
      }

      // Apply status filter
      if (filters.status) {
        combined = combined.filter((tx) => tx.status === filters.status)
      }

      // Sort by created_at descending
      combined.sort((a, b) => {
        try {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
        } catch (error) {
          console.error("Error sorting transactions:", error, { a: a.created_at, b: b.created_at })
          return 0
        }
      })

      return combined.slice(0, limit)
    } catch (error) {
      console.error("Error in getAdminAllTransactions:", error)
      console.error("Error details:", error?.message, error?.stack)
      throw error // Re-throw to be caught by API route
    }
  },
}

