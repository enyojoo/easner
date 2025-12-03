/**
 * QuickActionButton - Premium floating action button for dashboard
 * 
 * Features:
 * - Gradient icon container
 * - Haptic feedback
 * - Scale animation on press
 * - Shadow elevation
 */

import React, { useRef, useCallback } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { colors, shadows, textStyles, borderRadius } from '../../theme'

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  gradient?: readonly [string, string, ...string[]]
  iconColor?: string
  style?: ViewStyle
}

export default function QuickActionButton({
  icon,
  label,
  onPress,
  gradient = colors.primary.gradient,
  iconColor = colors.text.inverse,
  style,
}: QuickActionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }, [scaleAnim])

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }, [scaleAnim])

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }, [onPress])

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Ionicons name={icon} size={26} color={iconColor} />
        </LinearGradient>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchable: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    marginBottom: 8,
  },
  label: {
    ...textStyles.labelLarge,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
