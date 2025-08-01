import { useAdminDataStore } from "@/stores/admin-data-store"

export const useAdminData = () => {
  const adminDataStore = useAdminDataStore()

  // Update the return statement to include exchangeRates
  return {
    data: adminDataStore.getData(),
    exchangeRates: adminDataStore.getData()?.exchangeRates || [],
    loading: adminDataStore.isLoading(),
    error: null,
  }
}
