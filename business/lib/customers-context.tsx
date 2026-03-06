"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { mockCustomers, type Customer } from "@/lib/mock-data"

interface CustomersContextValue {
  customers: Customer[]
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
}

const CustomersContext = createContext<CustomersContextValue | null>(null)

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)

  const addCustomer = useCallback((customer: Customer) => {
    setCustomers((prev) => [customer, ...prev])
  }, [])

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return (
    <CustomersContext.Provider
      value={{ customers, addCustomer, updateCustomer, deleteCustomer }}
    >
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomersContext)
  if (!ctx) {
    throw new Error("useCustomers must be used within CustomersProvider")
  }
  return ctx
}
