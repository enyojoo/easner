/**
 * GradientCard - Premium card with gradient background and animations
 * 
 * Features:
 * - Beautiful gradient backgrounds
 * - Press animation with scale
 * - Customizable shadows
 */

import React, { useRef, useCallback } from 'react'
import {
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { colors, shadows, borderRadius } from '../../theme'

interface GradientCardProps {
  children: React.ReactNode
  onPress?: () => void
  gradient?: readonly [string, string, ...string[]]
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal'
  style?: ViewStyle
  contentStyle?: ViewStyle
  variant?: 'gradient' | 'solid'
  shadowSize?: 'none' | 'sm' | 'md' | 'lg'
  borderRadiusSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  haptic?: boolean
  animated?: boolean
  solidColor?: string
}

export default function GradientCard({
  children,
  onPress,
  gradient = colors.cardGradients.premium,
  gradientDirection = 'diagonal',
  style,
  contentStyle,
  variant = 'gradient',
  shadowSize = 'md',
  borderRadiusSize = 'xl',
  haptic = true,
  animated = true,
  solidColor = colors.neutral.white,
}: GradientCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = useCallback(() => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start()
    }
  }, [animated, onPress, scaleAnim])

  const handlePressOut = useCallback(() => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start()
    }
  }, [animated, onPress, scaleAnim])

  const handlePress = useCallback(async () => {
    if (onPress) {
      if (haptic) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
      onPress()
    }
  }, [onPress, haptic])

  const getGradientProps = () => {
    switch (gradientDirection) {
      case 'horizontal':
        return { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } }
      case 'vertical':
        return { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } }
      case 'diagonal':
      default:
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
    }
  }

  const cardRadius = borderRadius[borderRadiusSize]
  const cardShadow = shadowSize === 'none' ? {} : shadows[shadowSize]

  const cardStyle = [
    styles.card,
    { borderRadius: cardRadius },
    cardShadow,
    style,
  ]

  const renderContent = () => (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  )

  const renderCard = () => {
    switch (variant) {
      case 'solid':
        return (
          <View style={[cardStyle, { backgroundColor: solidColor }]}>
            {renderContent()}
          </View>
        )
      case 'gradient':
      default:
        return (
          <LinearGradient
            colors={gradient}
            {...getGradientProps()}
            style={cardStyle}
          >
            {renderContent()}
          </LinearGradient>
        )
    }
  }

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {renderCard()}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return renderCard()
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
})
