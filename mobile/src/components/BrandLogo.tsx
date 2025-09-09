import React from 'react'
import { Image, StyleSheet, ImageStyle } from 'react-native'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  style?: ImageStyle
}

// Easner primary color
const PRIMARY_COLOR = '#007ACC'

export default function BrandLogo({ size = 'md', style }: BrandLogoProps) {
  const getSizeStyles = (): ImageStyle => {
    switch (size) {
      case 'sm':
        return { width: 80, height: 24 }
      case 'md':
        return { width: 120, height: 36 }
      case 'lg':
        return { width: 160, height: 48 }
      default:
        return { width: 120, height: 36 }
    }
  }

  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[getSizeStyles(), style]}
      resizeMode="contain"
    />
  )
}
