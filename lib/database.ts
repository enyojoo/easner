import { supabase, createServerClient } from "./supabase"
import { dataCache, CACHE_KEYS } from "./cache"

// User operations
export const userService = {
  async findByEmail(email: string) {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async updateProfile(
    userId: string,
    updates: {
      firstName?: string
      lastName?: string
      phone?: string
      baseCurrency?: string
    },
  ) {
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        base_currency: updates.baseCurrency,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    // Invalidate user profile cache
    dataCache.invalidate(CACHE_KEYS.USER_PROFILE(userId))

    return data
  },

  async getStats() {
    const { data: totalUsers } = await supabase.from("users").select("id", { count: "exact" })

    const { data: activeUsers } = await supabase.from("users").select("id", { count: "exact" }).eq("status", "active")

    const { data: verifiedUsers } = await supabase
      .from("users")
      .select("id", { count: "exact" })
      .eq("verification_status", "verified")

    return {
      total: totalUsers?.length || 0,
      active: activeUsers?.length || 0,
      verified: verifiedUsers?.length || 0,
    }
  },
}

// Currency operations with stale-while-revalidate caching
export const currencyService = {
  async getAll() {
    const refreshFn = async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("id, code, name, symbol, flag_svg, status, created_at, updated_at")
        .eq("status", "active")
        .order("code")

      if (error) throw error

      return (
        data?.map((currency) => ({
          ...currency,
          flag: currency.flag_svg,
        })) || []
      )
    }

    // Try cache first with background refresh
    const cached = dataCache.getWithRefresh(CACHE_KEYS.CURRENCIES, refreshFn)
    if (cached) {
      return cached
    }

    // If no cache, fetch fresh data
    const currencies = await refreshFn()
    dataCache.set(CACHE_KEYS.CURRENCIES, currencies, 5 * 60 * 1000) // 5 minutes
    return currencies
  },

  async getExchangeRates() {
    const refreshFn = async () => {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select(`
          *,
          from_currency_info:currencies!exchange_rates_from_currency_fkey(id, code, name, symbol, flag_svg),
          to_currency_info:currencies!exchange_rates_to_currency_fkey(id, code, name, symbol, flag_svg)
        `)
        .eq("status", "active")

      if (error) throw error

      return (
        data?.map((rate) => ({
          ...rate,
          from_currency_info: rate.from_currency_info
            ? {
                ...rate.from_currency_info,
                flag: rate.from_currency_info.flag_svg,
              }
            : undefined,
          to_currency_info: rate.to_currency_info
            ? {
                ...rate.to_currency_info,
                flag: rate.to_currency_info.flag_svg,
              }
            : undefined,
        })) || []
      )
    }

    // Try cache first with background refresh
    const cached = dataCache.getWithRefresh(CACHE_KEYS.EXCHANGE_RATES, refreshFn)
    if (cached) {
      return cached
    }

    // If no cache, fetch fresh data
    const rates = await refreshFn()
    dataCache.set(CACHE_KEYS.EXCHANGE_RATES, rates, 2 * 60 * 1000) // 2 minutes
    return rates
  },

  async getRate(fromCurrency: string, toCurrency: string) {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("from_currency", fromCurrency)
      .eq("to_currency", toCurrency)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async updateRate(fromCurrency: string, toCurrency: string, rate: number, feeType = "free", feeAmount = 0) {
    const { data, error } = await supabase
      .from("exchange_rates")
      .upsert({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate,
        fee_type: feeType,
        fee_amount: feeAmount,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Force refresh exchange rates cache
    dataCache.invalidate(CACHE_KEYS.EXCHANGE_RATES)

    return data
  },
}

// Recipient operations with improved caching
export const recipientService = {
  async create(
    userId: string,
    recipientData: {
      fullName: string
      accountNumber: string
      bankName: string
      phoneNumber?: string
      currency: string
      routingNumber?: string
      sortCode?: string
      iban?: string
      swiftBic?: string
    },
  ) {
    const { data, error } = await supabase
      .from("recipients")
      .insert({
        user_id: userId,
        full_name: recipientData.fullName,
        account_number: recipientData.accountNumber,
        bank_name: recipientData.bankName,
        phone_number: recipientData.phoneNumber,
        currency: recipientData.currency,
        routing_number: recipientData.routingNumber,
        sort_code: recipientData.sortCode,
        iban: recipientData.iban,
        swift_bic: recipientData.swiftBic,
      })
      .select()
      .single()

    if (error) throw error

    // Force refresh user recipients cache
    dataCache.invalidate(CACHE_KEYS.USER_RECIPIENTS(userId))

    return data
  },

  async getByUserId(userId: string, requestingUserId?: string) {
    // Validate user access if requestingUserId is provided
    if (requestingUserId && requestingUserId !== userId) {
      throw new Error("Access denied: You can only view your own recipients")
    }

    const refreshFn = async () => {
      const { data, error } = await supabase
        .from("recipients")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    }

    // Try cache first with background refresh
    const cached = dataCache.getWithRefresh(CACHE_KEYS.USER_RECIPIENTS(userId), refreshFn)
    if (cached) {
      return cached
    }

    // If no cache, fetch fresh data
    const recipients = await refreshFn()
    dataCache.set(CACHE_KEYS.USER_RECIPIENTS(userId), recipients, 2 * 60 * 1000) // 2 minutes
    return recipients
  },

  async update(
    recipientId: string,
    updates: {
      fullName?: string
      accountNumber?: string
      bankName?: string
      phoneNumber?: string
      routingNumber?: string
      sortCode?: string
      iban?: string
      swiftBic?: string
    },
  ) {
    const updateData: Record<string, any> = {}
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName
    if (updates.accountNumber !== undefined) updateData.account_number = updates.accountNumber
    if (updates.bankName !== undefined) updateData.bank_name = updates.bankName
    if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber
    if (updates.routingNumber !== undefined) updateData.routing_number = updates.routingNumber
    if (updates.sortCode !== undefined) updateData.sort_code = updates.sortCode
    if (updates.iban !== undefined) updateData.iban = updates.iban
    if (updates.swiftBic !== undefined) updateData.swift_bic = updates.swiftBic

    const { data, error } = await supabase
      .from("recipients")
      .update(updateData)
      .eq("id", recipientId)
      .select()
      .single()

    if (error) throw error

    // Invalidate related caches
    dataCache.invalidatePattern("user_recipients_")

    return data
  },

  async delete(recipientId: string) {
    const { error } = await supabase.from("recipients").delete().eq("id", recipientId)

    if (error) throw error

    // Invalidate related caches
    dataCache.invalidatePattern("user_recipients_")
  },
}

// Transaction operations with enhanced access control
export const transactionService = {
  async create(transactionData: {
    userId: string
    recipientId: string
    sendAmount: number
    sendCurrency: string
    receiveAmount: number
    receiveCurrency: string
    exchangeRate: number
    feeAmount: number
    feeType: string
    totalAmount: number
    reference?: string
  }, requestingUserId?: string) {
    // Validate user access if requestingUserId is provided
    if (requestingUserId && requestingUserId !== transactionData.userId) {
      throw new Error("Access denied: You can only create transactions for yourself")
    }

    const transactionId = `ETID${Date.now()}`

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Transaction creation timeout")), 15000),
      )

      const createPromise = supabase
        .from("transactions")
        .insert({
          transaction_id: transactionId,
          user_id: transactionData.userId,
          recipient_id: transactionData.recipientId,
          send_amount: transactionData.sendAmount,
          send_currency: transactionData.sendCurrency,
          receive_amount: transactionData.receiveAmount,
          receive_currency: transactionData.receiveCurrency,
          exchange_rate: transactionData.exchangeRate,
          fee_amount: transactionData.feeAmount,
          fee_type: transactionData.feeType,
          total_amount: transactionData.totalAmount,
          reference: transactionData.reference,
        })
        .select()
        .single()

      const { data, error } = (await Promise.race([createPromise, timeoutPromise])) as any

      if (error) throw error

      // Force refresh user transactions cache
      dataCache.invalidate(CACHE_KEYS.USER_TRANSACTIONS(transactionData.userId))

      // Send initial pending status email via API (non-blocking)
      try {
        console.log('Sending initial pending email for transaction:', data.transaction_id)
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        
        // Use fetch to call the email API endpoint
        fetch(`${baseUrl}/api/send-email-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'transaction',
            transactionId: data.transaction_id,
            status: 'pending'
          })
        }).then(response => {
          if (response.ok) {
            console.log('Initial pending email sent successfully')
          } else {
            console.error('Failed to send initial transaction email:', response.statusText)
          }
        }).catch(error => {
          console.error('Failed to send initial transaction email:', error)
        })
      } catch (emailError) {
        console.error('Failed to send initial transaction email:', emailError)
        // Don't fail the transaction creation if email fails
      }

      return data
    } catch (error) {
      console.error("Transaction creation error:", error)
      throw new Error("Failed to create transaction. Please check your connection and try again.")
    }
  },

  async getByUserId(userId: string, limit = 20, requestingUserId?: string) {
    // Validate user access if requestingUserId is provided
    if (requestingUserId && requestingUserId !== userId) {
      throw new Error("Access denied: You can only view your own transactions")
    }

    const refreshFn = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          recipient:recipients(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    }

    // Try cache first with background refresh
    const cached = dataCache.getWithRefresh(CACHE_KEYS.USER_TRANSACTIONS(userId), refreshFn)
    if (cached) {
      return cached
    }

    // If no cache, fetch fresh data
    const transactions = await refreshFn()
    dataCache.set(CACHE_KEYS.USER_TRANSACTIONS(userId), transactions, 1 * 60 * 1000) // 1 minute
    return transactions
  },

  async getById(transactionId: string) {
    const refreshFn = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          recipient:recipients(*),
          user:users(first_name, last_name, email)
        `)
        .eq("transaction_id", transactionId)
        .single()

      if (error) throw error
      return data
    }

    // Try cache first with background refresh
    const cached = dataCache.getWithRefresh(CACHE_KEYS.TRANSACTION(transactionId), refreshFn)
    if (cached) {
      return cached
    }

    // If no cache, fetch fresh data
    const transaction = await refreshFn()
    const ttl = transaction.status === "completed" ? 5 * 60 * 1000 : 30 * 1000 // 5 min for completed, 30s for active
    dataCache.set(CACHE_KEYS.TRANSACTION(transactionId), transaction, ttl)
    return transaction
  },

  async updateStatus(transactionId: string, status: string) {
    const updates: any = { status }
    if (status === "completed") {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("transaction_id", transactionId)
      .select()
      .single()

    if (error) throw error

    // Force refresh transaction cache
    dataCache.invalidate(CACHE_KEYS.TRANSACTION(transactionId))
    dataCache.invalidatePattern("user_transactions_")

    return data
  },

  async uploadReceipt(transactionId: string, file: File) {
    try {
      // First check if transaction exists with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Transaction check timeout")), 10000),
      )

      const checkPromise = supabase
        .from("transactions")
        .select("id, transaction_id")
        .eq("transaction_id", transactionId)
        .single()

      const { data: existingTransaction, error: checkError } = (await Promise.race([
        checkPromise,
        timeoutPromise,
      ])) as any

      if (checkError || !existingTransaction) {
        console.error("Transaction check error:", checkError)
        throw new Error("Transaction not found. Please create the transaction first.")
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${transactionId}.${fileExt}`
      const filePath = `receipts/${fileName}`

      // Upload file to Supabase Storage with timeout
      const uploadTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout")), 30000),
      )

      const uploadPromise = supabase.storage.from("transaction-receipts").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      const { data: uploadData, error: uploadError } = (await Promise.race([
        uploadPromise,
        uploadTimeoutPromise,
      ])) as any

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("transaction-receipts").getPublicUrl(filePath)

      // Update transaction with receipt URL
      const updateTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database update timeout")), 10000),
      )

      const updatePromise = supabase
        .from("transactions")
        .update({
          receipt_url: publicUrl,
          receipt_filename: fileName,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId)
        .select()

      const { data, error } = (await Promise.race([updatePromise, updateTimeoutPromise])) as any

      if (error) {
        console.error("Database update error:", error)
        throw new Error(`Database update failed: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error("Failed to update transaction with receipt")
      }

      const updatedTransaction = data[0]

      // Force refresh transaction cache
      dataCache.invalidate(CACHE_KEYS.TRANSACTION(transactionId))

      return { ...updatedTransaction, receipt_url: publicUrl }
    } catch (error) {
      console.error("Receipt upload error:", error)
      throw error
    }
  },

  async getStats(timeRange = "today") {
    const dateFilter = new Date()

    switch (timeRange) {
      case "today":
        dateFilter.setHours(0, 0, 0, 0)
        break
      case "week":
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case "month":
        dateFilter.setMonth(dateFilter.getMonth() - 1)
        break
    }

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .gte("created_at", dateFilter.toISOString())

    const { data: pendingTransactions } = await supabase
      .from("transactions")
      .select("id", { count: "exact" })
      .in("status", ["pending", "processing"])

    const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.send_amount), 0) || 0

    return {
      totalTransactions: transactions?.length || 0,
      totalVolume,
      pendingTransactions: pendingTransactions?.length || 0,
    }
  },
}

// Payment Methods operations with improved caching
export const paymentMethodService = {
  async getAll() {
    const refreshFn = async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("currency", { ascending: true })
        .order("is_default", { ascending: false })

      if (error) throw error
      return data || []
    }

    // Try cache first with background refresh
    const cached = dataCache.getWithRefresh(CACHE_KEYS.PAYMENT_METHODS, refreshFn)
    if (cached) {
      return cached
    }

    // If no cache, fetch fresh data
    const methods = await refreshFn()
    dataCache.set(CACHE_KEYS.PAYMENT_METHODS, methods, 5 * 60 * 1000) // 5 minutes
    return methods
  },

  async getByCurrency(currency: string) {
    const allMethods = await this.getAll()
    return allMethods.filter((pm) => pm.currency === currency && pm.status === "active")
  },

  async create(paymentMethodData: {
    currency: string
    type: string
    name: string
    accountName?: string
    accountNumber?: string
    bankName?: string
    routingNumber?: string
    sortCode?: string
    iban?: string
    swiftBic?: string
    qrCodeData?: string
    instructions?: string
    isDefault?: boolean
  }) {
    const serverClient = createServerClient()

    // If setting as default, unset other defaults for the same currency
    if (paymentMethodData.isDefault) {
      await serverClient
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", paymentMethodData.currency)
    }

    const { data, error } = await serverClient
      .from("payment_methods")
      .insert({
        currency: paymentMethodData.currency,
        type: paymentMethodData.type,
        name: paymentMethodData.name,
        account_name: paymentMethodData.accountName,
        account_number: paymentMethodData.accountNumber,
        bank_name: paymentMethodData.bankName,
        routing_number: paymentMethodData.routingNumber,
        sort_code: paymentMethodData.sortCode,
        iban: paymentMethodData.iban,
        swift_bic: paymentMethodData.swiftBic,
        qr_code_data: paymentMethodData.qrCodeData,
        instructions: paymentMethodData.instructions,
        is_default: paymentMethodData.isDefault || false,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    // Force refresh payment methods cache
    dataCache.invalidate(CACHE_KEYS.PAYMENT_METHODS)

    return data
  },

  async update(
    id: string,
    updates: {
      currency?: string
      type?: string
      name?: string
      accountName?: string
      accountNumber?: string
      bankName?: string
      routingNumber?: string
      sortCode?: string
      iban?: string
      swiftBic?: string
      qrCodeData?: string
      instructions?: string
      isDefault?: boolean
    },
  ) {
    const serverClient = createServerClient()

    // If setting as default, unset other defaults for the same currency
    if (updates.isDefault && updates.currency) {
      await serverClient
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", updates.currency)
        .neq("id", id)
    }

    const updateData: Record<string, any> = {}
    if (updates.currency !== undefined) updateData.currency = updates.currency
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.accountName !== undefined) updateData.account_name = updates.accountName
    if (updates.accountNumber !== undefined) updateData.account_number = updates.accountNumber
    if (updates.bankName !== undefined) updateData.bank_name = updates.bankName
    if (updates.routingNumber !== undefined) updateData.routing_number = updates.routingNumber
    if (updates.sortCode !== undefined) updateData.sort_code = updates.sortCode
    if (updates.iban !== undefined) updateData.iban = updates.iban
    if (updates.swiftBic !== undefined) updateData.swift_bic = updates.swiftBic
    if (updates.qrCodeData !== undefined) updateData.qr_code_data = updates.qrCodeData
    if (updates.instructions !== undefined) updateData.instructions = updates.instructions
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault

    const { data, error } = await serverClient
      .from("payment_methods")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Force refresh payment methods cache
    dataCache.invalidate(CACHE_KEYS.PAYMENT_METHODS)

    return data
  },

  async updateStatus(id: string, status: string) {
    const serverClient = createServerClient()

    const { data, error } = await serverClient.from("payment_methods").update({ status }).eq("id", id).select().single()

    if (error) throw error

    // Force refresh payment methods cache
    dataCache.invalidate(CACHE_KEYS.PAYMENT_METHODS)

    return data
  },

  async setDefault(id: string, currency: string) {
    const serverClient = createServerClient()

    // Unset other defaults for the same currency
    await serverClient.from("payment_methods").update({ is_default: false }).eq("currency", currency)

    // Set this one as default
    const { data, error } = await serverClient
      .from("payment_methods")
      .update({ is_default: true })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Force refresh payment methods cache
    dataCache.invalidate(CACHE_KEYS.PAYMENT_METHODS)

    return data
  },

  async delete(id: string) {
    const serverClient = createServerClient()

    const { error } = await serverClient.from("payment_methods").delete().eq("id", id)

    if (error) throw error

    // Force refresh payment methods cache
    dataCache.invalidate(CACHE_KEYS.PAYMENT_METHODS)
  },
}

// Admin operations
export const adminService = {
  async verifyAdmin(email: string, password: string) {
    const serverClient = createServerClient()

    const { data: admin, error } = await serverClient
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single()

    if (error || !admin) return null

    // Since we removed password_hash, we need to use Supabase Auth for admin login too
    // This is a simplified approach - in production, you might want separate admin auth
    return admin
  },

  async getAllTransactions(
    filters: {
      status?: string
      currency?: string
      search?: string
      limit?: number
    } = {},
  ) {
    const serverClient = createServerClient()
    let query = serverClient.from("transactions").select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters.currency && filters.currency !== "all") {
      query = query.or(`send_currency.eq.${filters.currency},receive_currency.eq.${filters.currency}`)
    }

    if (filters.search) {
      query = query.or(`transaction_id.ilike.%${filters.search}%,user.email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(filters.limit || 50)

    if (error) throw error
    return data
  },

  async getAllUsers(
    filters: {
      status?: string
      verification?: string
      search?: string
      limit?: number
    } = {},
  ) {
    const serverClient = createServerClient()
    let query = serverClient.from("users").select("*")

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters.verification && filters.verification !== "all") {
      query = query.eq("verification_status", filters.verification)
    }

    if (filters.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`,
      )
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(filters.limit || 50)

    if (error) throw error
    return data
  },
}

// System settings operations
export const settingsService = {
  async get(key: string) {
    const { data, error } = await supabase.from("system_settings").select("value, data_type").eq("key", key).single()

    if (error && error.code !== "PGRST116") throw error

    if (!data) return null

    // Parse value based on data type
    switch (data.data_type) {
      case "boolean":
        return data.value === "true"
      case "number":
        return Number(data.value)
      case "json":
        return JSON.parse(data.value)
      default:
        return data.value
    }
  },

  async set(key: string, value: any, dataType = "string") {
    const serverClient = createServerClient()

    // Convert value to string for storage
    let stringValue: string
    switch (dataType) {
      case "boolean":
        stringValue = value ? "true" : "false"
        break
      case "number":
        stringValue = String(value)
        break
      case "json":
        stringValue = JSON.stringify(value)
        break
      default:
        stringValue = String(value)
    }

    const { data, error } = await serverClient
      .from("system_settings")
      .upsert({
        key,
        value: stringValue,
        data_type: dataType,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase.from("system_settings").select("*").order("key")

    if (error) throw error
    return data
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("key")

    if (error) throw error
    return data
  },

  async updateMultiple(settings: Array<{ key: string; value: any; dataType?: string }>) {
    const serverClient = createServerClient()

    const updates = settings.map(({ key, value, dataType = "string" }) => {
      let stringValue: string
      switch (dataType) {
        case "boolean":
          stringValue = value ? "true" : "false"
          break
        case "number":
          stringValue = String(value)
          break
        case "json":
          stringValue = JSON.stringify(value)
          break
        default:
          stringValue = String(value)
      }

      return { key, value: stringValue, data_type: dataType }
    })

    const { data, error } = await serverClient.from("system_settings").upsert(updates).select()

    if (error) throw error
    return data
  },
}
