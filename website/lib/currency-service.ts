import { supabase } from "./supabase"
import { dataCache, CACHE_KEYS } from "./cache"

export const currencyService = {
  async getAll() {
    const refreshFn = async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("id, code, name, symbol, flag_svg, status, can_send, can_receive, created_at, updated_at")
        .eq("status", "active")
        .order("code")

      if (error) throw error

      return (
        data?.map((c) => ({
          ...c,
          flag: c.flag_svg,
          can_send: c.can_send ?? true,
          can_receive: c.can_receive ?? true,
        })) || []
      )
    }

    const cached = dataCache.getWithRefresh(CACHE_KEYS.CURRENCIES, refreshFn)
    if (cached) return cached

    const currencies = await refreshFn()
    dataCache.set(CACHE_KEYS.CURRENCIES, currencies, 5 * 60 * 1000)
    return currencies
  },

  async getExchangeRates() {
    const refreshFn = async () => {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select(
          `*,
          from_currency_info:currencies!exchange_rates_from_currency_fkey(id, code, name, symbol, flag_svg),
          to_currency_info:currencies!exchange_rates_to_currency_fkey(id, code, name, symbol, flag_svg)`
        )
        .eq("status", "active")

      if (error) throw error

      return (
        data?.map((r) => ({
          ...r,
          from_currency_info: r.from_currency_info
            ? { ...r.from_currency_info, flag: r.from_currency_info.flag_svg }
            : undefined,
          to_currency_info: r.to_currency_info
            ? { ...r.to_currency_info, flag: r.to_currency_info.flag_svg }
            : undefined,
        })) || []
      )
    }

    const cached = dataCache.getWithRefresh(CACHE_KEYS.EXCHANGE_RATES, refreshFn)
    if (cached) return cached

    const rates = await refreshFn()
    dataCache.set(CACHE_KEYS.EXCHANGE_RATES, rates, 2 * 60 * 1000)
    return rates
  },
}
