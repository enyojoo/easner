import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

export default function OpenBankingScreen({ navigation, route }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  
  const { transactionId, sendAmount, receiveAmount, sendCurrency, receiveCurrency, recipient, paymentMethod } = route.params || {}
  
  // Determine if this is SBP (Russian Faster Payments System)
  const isSBP = paymentMethod === 'sbp' || sendCurrency === 'RUB'

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [headerAnim, contentAnim])

  const handleConnect = async () => {
    setLoading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    
    // TODO: Integrate Plaid/OpenBanking flow here
    // For now, simulate connection
    setTimeout(() => {
      setLoading(false)
      // After successful connection, navigate to transaction tracking
      navigation.navigate('SendTransactionDetails' as never, {
        transactionId: transactionId,
        sendAmount,
        receiveAmount,
        sendCurrency,
        receiveCurrency,
        recipient,
        paymentMethod: paymentMethod || 'linkBank',
      } as never)
    }, 2000)
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [{
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })
              }]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {isSBP ? 'Connect via SBP' : 'Link Bank Account'}
            </Text>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: contentAnim,
              transform: [{
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.infoContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="link" size={48} color={colors.primary.main} />
            </View>
            <Text style={styles.infoTitle}>
              {isSBP ? 'Connect via Faster Payments System' : 'Connect Your Bank'}
            </Text>
            <Text style={styles.infoText}>
              {isSBP 
                ? 'Securely connect your Russian bank account via SBP (Faster Payments System) to complete this payment. We use bank-level encryption to keep your information safe.'
                : 'Securely connect your bank account to complete this payment. We use bank-level encryption to keep your information safe.'}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text style={styles.loadingText}>
                {isSBP ? 'Connecting to SBP...' : 'Connecting to your bank...'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnect}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.primary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.connectButtonGradient}
              >
                <Text style={styles.connectButtonText}>
                  {isSBP ? 'Connect via SBP' : 'Connect Bank Account'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.frame.background,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...textStyles.headlineMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.main + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  infoTitle: {
    ...textStyles.headlineSmall,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  infoText: {
    ...textStyles.bodyLarge,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: spacing[8],
  },
  loadingText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    marginTop: spacing[3],
  },
  connectButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: spacing[4],
  },
  connectButtonGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    ...textStyles.titleLarge,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
})

