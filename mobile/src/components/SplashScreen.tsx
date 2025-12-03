import React, { useEffect, useRef } from 'react'
import { View, Image, StyleSheet, Dimensions, Animated } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface SplashScreenProps {
  onFinish: () => void
  isReady?: boolean // Whether auth and onboarding checks are complete
}

export default function CustomSplashScreen({ onFinish, isReady = false }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current
  const minDisplayTime = useRef(Date.now())

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync()
  }, [])

  useEffect(() => {
    if (isReady) {
      // Ensure minimum 3 seconds display time
      const elapsed = Date.now() - minDisplayTime.current
      const remainingTime = Math.max(0, 3000 - elapsed)

      const timer = setTimeout(() => {
        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onFinish()
        })
      }, remainingTime)

      return () => clearTimeout(timer)
    }
  }, [isReady, onFinish, fadeAnim])

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="light" />
      <Image
        source={require('../../assets/onboarding/Splash.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
})

