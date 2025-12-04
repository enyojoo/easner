import React, { createContext, useContext, useState, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import Toast, { ToastType } from './Toast'

interface ToastData {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onPress: () => void
  }
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    action?: { label: string; onPress: () => void }
  ) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration = 3000,
      action?: { label: string; onPress: () => void }
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev, { id, message, type, duration, action }])
    },
    []
  )

  const showSuccess = useCallback(
    (message: string, duration = 3000) => {
      showToast(message, 'success', duration)
    },
    [showToast]
  )

  const showError = useCallback(
    (message: string, duration = 4000) => {
      showToast(message, 'error', duration)
    },
    [showToast]
  )

  const showInfo = useCallback(
    (message: string, duration = 3000) => {
      showToast(message, 'info', duration)
    },
    [showToast]
  )

  const showWarning = useCallback(
    (message: string, duration = 3500) => {
      showToast(message, 'warning', duration)
    },
    [showToast]
  )

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showInfo, showWarning }}
    >
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            action={toast.action}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
})






