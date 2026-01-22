import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { colors, shadows, textStyles, spacing } from '../theme'

interface InternalHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  rightAction?: {
    label: string
    onPress: () => void
    icon?: React.ReactNode
  }
  style?: ViewStyle
}

export default function InternalHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
}: InternalHeaderProps) {
  const navigation = useNavigation()

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (onBack) {
      onBack()
    } else {
      navigation.goBack()
    }
  }

  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} accessibilityRole="text">
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={styles.rightAction}
          activeOpacity={0.7}
          accessibilityLabel={rightAction.label}
          accessibilityRole="button"
        >
          {rightAction.icon || (
            <Text style={styles.rightActionText}>{rightAction.label}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...textStyles.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  rightAction: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  rightActionText: {
    ...textStyles.labelMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
  },
})






















