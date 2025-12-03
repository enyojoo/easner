/**
 * ShimmerLoader - Premium shimmer loading placeholder
 * 
 * Features:
 * - Animated gradient effect
 * - Configurable shapes
 * - Natural loading feel
 */

import React, { useEffect, useRef } from 'react'
import { StyleSheet, View, ViewStyle, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, borderRadius } from '../../theme'

interface ShimmerLoaderProps {
  width: number | string
  height: number
  borderRadius?: number
  style?: ViewStyle
}

export default function ShimmerLoader({
  width,
  height,
  borderRadius: radius = borderRadius.md,
  style,
}: ShimmerLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    )
    animation.start()
    return () => animation.stop()
  }, [shimmerAnim])

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  })

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.4)',
            'transparent',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  )
}

// Pre-built shimmer components for common use cases
export function ShimmerCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <ShimmerLoader width="100%" height={120} borderRadius={borderRadius.xl} />
    </View>
  )
}

export function ShimmerText({ 
  width = 100, 
  height = 16,
  style 
}: { 
  width?: number | string
  height?: number
  style?: ViewStyle 
}) {
  return (
    <ShimmerLoader 
      width={width} 
      height={height} 
      borderRadius={borderRadius.sm}
      style={style}
    />
  )
}

export function ShimmerAvatar({ size = 48, style }: { size?: number; style?: ViewStyle }) {
  return (
    <ShimmerLoader
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  )
}

export function ShimmerListItem({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.listItem, style]}>
      <ShimmerAvatar size={40} />
      <View style={styles.listItemContent}>
        <ShimmerText width="70%" height={14} />
        <ShimmerText width="40%" height={12} style={{ marginTop: 8 }} />
      </View>
      <ShimmerText width={60} height={16} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
    width: 200,
  },
  card: {
    padding: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
  },
})
