import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { colors } from '../theme'

interface GradientBackgroundProps {
  children: React.ReactNode
  style?: ViewStyle
}

/**
 * Reusable gradient background component
 * Uses the primary color as a solid background
 */
export default function GradientBackground({ 
  children, 
  style
}: GradientBackgroundProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.primary.main }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
})

