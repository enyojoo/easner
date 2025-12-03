import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationProps } from '../../types'
import { colors, textStyles, borderRadius, spacing } from '../../theme'
import GradientBackground from '../../components/GradientBackground'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Onboarding images
const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'A Global\nMoney App',
    image: require('../../../assets/onboarding/onboarding-step1.png'),
  },
  {
    id: 2,
    title: 'Send Money\nLike SMS',
    image: require('../../../assets/onboarding/onboarding-step2.png'),
  },
  {
    id: 3,
    title: 'Spend with\nYour Card',
    image: require('../../../assets/onboarding/onboarding-step3.png'),
  },
]

const ONBOARDING_COMPLETED_KEY = '@easner_onboarding_completed'

export default function OnboardingScreen({ navigation }: NavigationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const insets = useSafeAreaInsets()

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / SCREEN_WIDTH)
    if (index !== currentIndex) {
      setCurrentIndex(index)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      })
      setCurrentIndex(nextIndex)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } else {
      await handleGetStarted()
    }
  }

  const handleSkip = async () => {
    await handleGetStarted()
  }

  const handleGetStarted = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true')
      // Mark that user is coming from onboarding to show back arrow on auth screen
      await AsyncStorage.setItem('@easner_from_onboarding', 'true')
      // Small delay to ensure AsyncStorage is saved before AppNavigator re-checks
      setTimeout(() => {
        // AppNavigator will automatically switch to AuthStack
      }, 100)
    } catch (error) {
      console.error('Error saving onboarding status:', error)
    }
  }

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    })
    setCurrentIndex(index)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Progress Dots - Top */}
        <View style={[styles.pagination, { paddingTop: insets.top + spacing[4] }]}>
          {ONBOARDING_DATA.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
              onPress={() => goToSlide(index)}
              activeOpacity={0.7}
            />
          ))}
        </View>

        {/* Scrollable Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {ONBOARDING_DATA.map((item) => (
            <View key={item.id} style={styles.slide}>
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{item.title}</Text>
              </View>

              {/* App Mockup Image */}
              <View style={styles.imageWrapper}>
                <Image
                  source={item.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Dark Fade Overlay from Bottom of Screen */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.75)', 'rgba(0, 0, 0, 0.95)', '#000000', '#000000']}
          locations={[0, 0.2, 0.4, 0.6, 0.8, 0.9, 1]}
          style={styles.fadeOverlay}
          pointerEvents="none"
        />

        {/* Action Buttons on Dark Fade Area */}
        <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, spacing[6]) }]}>
          <TouchableOpacity
            style={styles.skipButtonBottom}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link - Bottom */}
        <TouchableOpacity
          style={[styles.loginLink, { paddingBottom: Math.max(insets.bottom, spacing[4]) }]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            try {
              // Mark onboarding as completed
            await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true')
              // Mark that user is coming from onboarding to show back arrow on auth screen
              await AsyncStorage.setItem('@easner_from_onboarding', 'true')
              // Small delay to ensure AsyncStorage is saved before AppNavigator re-checks
              setTimeout(() => {
                // AppNavigator will automatically switch to AuthStack
              }, 100)
            } catch (error) {
              console.error('Error navigating to login:', error)
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLinkText}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing[1],
  },
  dotActive: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing[5],
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    fontSize: 42,
    lineHeight: 50,
    color: colors.text.inverse,
    textAlign: 'center',
    fontFamily: 'Outfit-Bold',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: SCREEN_WIDTH,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.7,
    zIndex: 1,
  },
  bottomActions: {
    position: 'absolute',
    bottom: spacing[20],
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    gap: spacing[3],
    zIndex: 2,
  },
  skipButtonBottom: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius['3xl'],
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius['3xl'],
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  nextButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
  },
  loginLink: {
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingHorizontal: spacing[5],
    zIndex: 3,
  },
  loginText: {
    ...textStyles.bodySmall,
    color: colors.text.inverse,
    fontFamily: 'Outfit-Regular',
    opacity: 0.9,
  },
  loginLinkText: {
    ...textStyles.bodySmall,
    color: colors.text.inverse,
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
  },
})
