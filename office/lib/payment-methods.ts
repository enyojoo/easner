import { supabase } from "./supabase"

export const paymentMethodService = {
  async getAll() {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("currency", { ascending: true })
      .order("is_default", { ascending: false })

    if (error) throw error
    return data || []
  },
}
