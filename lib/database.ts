import { supabase } from "./supabase"

// Cache system for database queries
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATIONS = {
  transactions: 2 * 60 * 1000, // 2 minutes
  recipients: 5 * 60 * 1000, // 5 minutes
  rates: 10 * 60 * 1000, // 10 minutes
  users: 5 * 60 * 1000, // 5 minutes
}

function getCacheKey(table: string, filters: any = {}) {
  return `${table}_${JSON.stringify(filters)}`
}

function getFromCache(key: string, maxAge: number) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < maxAge) {
    return cached.data
  }
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// User operations
export const userService = {
  async findByEmail(email: string) {
    const cacheKey = `user:email:${email}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.users)
    if (cached) return cached

    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") throw error

    if (data) setCache(cacheKey, data)
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

    // Clear user cache
    invalidateCache(`user:${userId}`)

    return data
  },

  async getStats() {
    const cacheKey = "user:stats"
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.users)
    if (cached) return cached

    const { data: totalUsers } = await supabase.from("users").select("id", { count: "exact" })
    const { data: activeUsers } = await supabase.from("users").select("id", { count: "exact" }).eq("status", "active")
    const { data: verifiedUsers } = await supabase
      .from("users")
      .select("id", { count: "exact" })
      .eq("verification_status", "verified")

    const stats = {
      total: totalUsers?.length || 0,
      active: activeUsers?.length || 0,
      verified: verifiedUsers?.length || 0,
    }

    setCache(cacheKey, stats)
    return stats
  },
}

// Currency operations
export const currencyService = {
  async getAll() {
    const cacheKey = "currencies:all"
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.rates)
    if (cached) return cached

    const { data, error } = await supabase
      .from("currencies")
      .select("id, code, name, symbol, flag_svg, status, created_at, updated_at")
      .eq("status", "active")
      .order("code")

    if (error) throw error

    const currencies =
      data?.map((currency) => ({
        ...currency,
        flag: currency.flag_svg,
      })) || []

    setCache(cacheKey, currencies)
    return currencies
  },

  async getExchangeRates() {
    const cacheKey = "exchange_rates:all"
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.rates)
    if (cached) return cached

    const { data, error } = await supabase
      .from("exchange_rates")
      .select(`
        *,
        from_currency_info:currencies!exchange_rates_from_currency_fkey(id, code, name, symbol, flag_svg),
        to_currency_info:currencies!exchange_rates_to_currency_fkey(id, code, name, symbol, flag_svg)
      `)
      .eq("status", "active")

    if (error) throw error

    const rates =
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

    setCache(cacheKey, rates)
    return rates
  },

  async getRate(fromCurrency: string, toCurrency: string) {
    const cacheKey = `rate:${fromCurrency}:${toCurrency}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.rates)
    if (cached) return cached

    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("from_currency", fromCurrency)
      .eq("to_currency", toCurrency)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") throw error

    if (data) setCache(cacheKey, data)
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

    // Clear rate cache
    invalidateCache("rate:")
    invalidateCache("exchange_rates:all")

    return data
  },
}

// Recipient operations
export const recipientService = {
  async create(
    userId: string,
    recipientData: {
      fullName: string
      accountNumber: string
      bankName: string
      phoneNumber?: string
      currency: string
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
      })
      .select()
      .single()

    if (error) throw error

    // Clear recipients cache for this user
    invalidateRecipientsCache(userId)

    return data
  },

  async getByUserId(userId: string) {
    const cacheKey = `recipients:${userId}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.recipients)
    if (cached) return cached

    const { data, error } = await supabase
      .from("recipients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    setCache(cacheKey, data)
    return data
  },

  async update(
    recipientId: string,
    updates: {
      fullName?: string
      accountNumber?: string
      bankName?: string
      phoneNumber?: string
    },
  ) {
    const { data, error } = await supabase
      .from("recipients")
      .update({
        full_name: updates.fullName,
        account_number: updates.accountNumber,
        bank_name: updates.bankName,
        phone_number: updates.phoneNumber,
      })
      .eq("id", recipientId)
      .select()
      .single()

    if (error) throw error

    // Clear recipients cache
    invalidateRecipientsCache("")

    return data
  },

  async delete(recipientId: string) {
    const { error } = await supabase.from("recipients").delete().eq("id", recipientId)

    if (error) throw error

    // Clear recipients cache
    invalidateRecipientsCache("")
  },
}

// Transaction operations
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
  }) {
    const transactionId = `NP${Date.now()}`

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        transaction_id: transactionId,
        sender_id: transactionData.userId,
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

    if (error) throw error

    // Clear transactions cache for this user
    invalidateTransactionsCache(transactionData.userId)

    return data
  },

  async getByUserId(userId: string, limit = 50) {
    const cacheKey = `transactions:${userId}:${limit}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.transactions)
    if (cached) return cached

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        sender:users!transactions_sender_id_fkey(first_name, last_name, email),
        recipient:recipients(*)
      `)
      .eq("sender_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    setCache(cacheKey, data)
    return data
  },

  async getById(transactionId: string) {
    const cacheKey = `transaction:${transactionId}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.transactions)
    if (cached) return cached

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        sender:users!transactions_sender_id_fkey(first_name, last_name, email),
        recipient:recipients(*)
      `)
      .eq("transaction_id", transactionId)
      .single()

    if (error) throw error

    setCache(cacheKey, data)
    return data
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

    // Clear transaction cache
    invalidateCache(`transaction:${transactionId}`)
    invalidateTransactionsCache("")

    return data
  },

  async uploadReceipt(transactionId: string, file: File) {
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${transactionId}_${Date.now()}.${fileExt}`
      const filePath = `receipts/${fileName}`

      // Upload file to Supabase Storage using client-side upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("transaction-receipts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("transaction-receipts").getPublicUrl(filePath)

      // Update transaction with receipt URL
      const { data, error } = await supabase
        .from("transactions")
        .update({
          receipt_url: publicUrl,
          receipt_filename: fileName,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId)
        .select()
        .single()

      if (error) {
        console.error("Database update error:", error)
        throw new Error(`Database update failed: ${error.message}`)
      }

      // Clear transaction cache
      invalidateCache(`transaction:${transactionId}`)

      return { ...data, receipt_url: publicUrl }
    } catch (error) {
      console.error("Receipt upload error:", error)
      throw error
    }
  },

  async getStats(timeRange = "today") {
    const cacheKey = `transaction_stats:${timeRange}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.transactions)
    if (cached) return cached

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

    const stats = {
      totalTransactions: transactions?.length || 0,
      totalVolume,
      pendingTransactions: pendingTransactions?.length || 0,
    }

    setCache(cacheKey, stats)
    return stats
  },
}

// Payment Methods operations
export const paymentMethodService = {
  async getAll() {
    const cacheKey = "payment_methods:all"
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.rates)
    if (cached) return cached

    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("currency", { ascending: true })
      .order("is_default", { ascending: false })

    if (error) throw error

    setCache(cacheKey, data || [])
    return data || []
  },

  async getByCurrency(currency: string) {
    const cacheKey = `payment_methods:${currency}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.rates)
    if (cached) return cached

    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("currency", currency)
      .eq("status", "active")
      .order("is_default", { ascending: false })

    if (error) throw error

    setCache(cacheKey, data || [])
    return data || []
  },

  async create(paymentMethodData: {
    currency: string
    type: string
    name: string
    accountName?: string
    accountNumber?: string
    bankName?: string
    qrCodeData?: string
    instructions?: string
    isDefault?: boolean
  }) {
    const { data, error } = await supabase
      .from("payment_methods")
      .insert({
        currency: paymentMethodData.currency,
        type: paymentMethodData.type,
        name: paymentMethodData.name,
        account_name: paymentMethodData.accountName,
        account_number: paymentMethodData.accountNumber,
        bank_name: paymentMethodData.bankName,
        qr_code_data: paymentMethodData.qrCodeData,
        instructions: paymentMethodData.instructions,
        is_default: paymentMethodData.isDefault || false,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    // Clear payment methods cache
    invalidateCache("payment_methods:")

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
      qrCodeData?: string
      instructions?: string
      isDefault?: boolean
    },
  ) {
    const { data, error } = await supabase
      .from("payment_methods")
      .update({
        currency: updates.currency,
        type: updates.type,
        name: updates.name,
        account_name: updates.accountName,
        account_number: updates.accountNumber,
        bank_name: updates.bankName,
        qr_code_data: updates.qrCodeData,
        instructions: updates.instructions,
        is_default: updates.isDefault,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Clear payment methods cache
    invalidateCache("payment_methods:")

    return data
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase.from("payment_methods").update({ status }).eq("id", id).select().single()

    if (error) throw error

    // Clear payment methods cache
    invalidateCache("payment_methods:")

    return data
  },

  async setDefault(id: string, currency: string) {
    // Unset other defaults for the same currency
    await supabase.from("payment_methods").update({ is_default: false }).eq("currency", currency).neq("id", id)

    // Set this one as default
    const { data, error } = await supabase
      .from("payment_methods")
      .update({ is_default: true })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Clear payment methods cache
    invalidateCache("payment_methods:")

    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from("payment_methods").delete().eq("id", id)

    if (error) throw error

    // Clear payment methods cache
    invalidateCache("payment_methods:")
  },
}

// Admin operations
export const adminService = {
  async verifyAdmin(email: string, password: string) {
    const { data: admin, error } = await supabase
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
    let query = supabase.from("transactions").select(`
        *,
        sender:users!transactions_sender_id_fkey(first_name, last_name, email),
        recipient:recipients(*)
      `)

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters.currency && filters.currency !== "all") {
      query = query.or(`send_currency.eq.${filters.currency},receive_currency.eq.${filters.currency}`)
    }

    if (filters.search) {
      query = query.or(`transaction_id.ilike.%${filters.search}%,sender.email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(filters.limit || 100)

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
    let query = supabase.from("users").select("*")

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

    const { data, error } = await query.order("created_at", { ascending: false }).limit(filters.limit || 100)

    if (error) throw error
    return data
  },
}

// System settings operations
export const settingsService = {
  async get(key: string) {
    const cacheKey = `setting:${key}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.rates)
    if (cached !== null) return cached

    const { data, error } = await supabase.from("system_settings").select("value, data_type").eq("key", key).single()

    if (error && error.code !== "PGRST116") throw error

    if (!data) return null

    // Parse value based on data type
    let parsedValue
    switch (data.data_type) {
      case "boolean":
        parsedValue = data.value === "true"
        break
      case "number":
        parsedValue = Number(data.value)
        break
      case "json":
        parsedValue = JSON.parse(data.value)
        break
      default:
        parsedValue = data.value
    }

    setCache(cacheKey, parsedValue)
    return parsedValue
  },

  async set(key: string, value: any, dataType = "string") {
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

    const { data, error } = await supabase
      .from("system_settings")
      .upsert({
        key,
        value: stringValue,
        data_type: dataType,
      })
      .select()
      .single()

    if (error) throw error

    // Clear settings cache
    invalidateCache(`setting:${key}`)

    return data
  },

  async getAll() {
    const cacheKey = "settings:all"
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.rates)
    if (cached) return cached

    const { data, error } = await supabase.from("system_settings").select("*").order("key")

    if (error) throw error

    setCache(cacheKey, data)
    return data
  },

  async getByCategory(category: string) {
    const cacheKey = `settings:category:${category}`
    const cached = getFromCache(cacheKey, CACHE_DURATIONS.rates)
    if (cached) return cached

    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("key")

    if (error) throw error

    setCache(cacheKey, data)
    return data
  },

  async updateMultiple(settings: Array<{ key: string; value: any; dataType?: string }>) {
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

    const { data, error } = await supabase.from("system_settings").upsert(updates).select()

    if (error) throw error

    // Clear settings cache
    invalidateCache("settings:")

    return data
  },
}

// Cache invalidation functions
export function invalidateCache(pattern?: string) {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

export function invalidateTransactionsCache(userId?: string) {
  invalidateCache("transactions")
}

export function invalidateRecipientsCache(userId: string) {
  invalidateCache(`recipients_${JSON.stringify({ userId })}`)
}
