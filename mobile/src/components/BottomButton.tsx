import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface BottomButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export default function BottomButton({ 
  title, 
  onPress, 
  disabled = false, 
  variant = 'primary' 
}: BottomButtonProps) {
  const insets = useSafeAreaInsets()
  
  return (
    <View style={[
      styles.container,
      { 
        paddingBottom: Math.max(insets.bottom + 8, 16),
        paddingHorizontal: 20,
      }
    ]}>
      <TouchableOpacity
        style={[
          styles.button,
          variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
          disabled && styles.disabledButton
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[
          styles.buttonText,
          variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText,
          disabled && styles.disabledButtonText
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: '#1D4FF3',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  disabledButtonText: {
    color: '#ffffff',
  },
})
