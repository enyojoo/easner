import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, borderRadius } from '../theme'

interface FrameContainerProps {
  children: React.ReactNode
  style?: ViewStyle
  paddingTop?: number
  paddingBottom?: number
  paddingHorizontal?: number
  marginHorizontal?: number
  marginTop?: number
}

export default function FrameContainer({
  children,
  style,
  paddingTop = spacing[5],
  paddingBottom = spacing[8],
  paddingHorizontal = spacing[5],
  marginHorizontal = spacing[5],
  marginTop = spacing[3],
}: FrameContainerProps) {
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop,
          paddingBottom,
          paddingHorizontal,
          marginHorizontal,
          marginTop,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.frame.background,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
})




