/**
 * AnimatedNumber - Number display with fade animation
 * 
 * Features:
 * - Fade animation on value change
 * - Currency formatting
 */

import React, { useEffect, useRef } from 'react'
import { Text, TextStyle, StyleSheet, Animated } from 'react-native'
import { colors, textStyles } from '../../theme'

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  style?: TextStyle
  formatOptions?: Intl.NumberFormatOptions
  animated?: boolean
}

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
  formatOptions,
  animated = true,
}: AnimatedNumberProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (animated) {
      fadeAnim.setValue(0.5)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [value, animated, fadeAnim])

  const formatNumber = (num: number) => {
    if (formatOptions) {
      return num.toLocaleString(undefined, formatOptions)
    }
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  if (!animated) {
    return (
      <Text style={[styles.text, style]}>
        {prefix}{formatNumber(value)}{suffix}
      </Text>
    )
  }

  return (
    <Animated.Text style={[styles.text, style, { opacity: fadeAnim }]}>
      {prefix}{formatNumber(value)}{suffix}
    </Animated.Text>
  )
}

// Simple fade number component
export function FadeNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
  formatOptions,
}: Omit<AnimatedNumberProps, 'animated'>) {
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [value, fadeAnim])

  const formatNumber = (num: number) => {
    if (formatOptions) {
      return num.toLocaleString(undefined, formatOptions)
    }
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  return (
    <Animated.Text style={[styles.text, style, { opacity: fadeAnim }]}>
      {prefix}{formatNumber(value)}{suffix}
    </Animated.Text>
  )
}

const styles = StyleSheet.create({
  text: {
    ...textStyles.currencyLarge,
    color: colors.text.primary,
  },
})
