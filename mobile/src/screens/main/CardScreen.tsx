import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ImageBackground,
  Animated,
  Image,
  Clipboard,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus, Snowflake, Settings, Monitor, Apple, ArrowRight, Eye, EyeOff, Copy, Check } from 'lucide-react-native'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps } from '../../types'
import { colors, textStyles, borderRadius, spacing, shadows } from '../../theme'
import Svg, { Path } from 'react-native-svg'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = 323
const CARD_HEIGHT = 190
const CARD_WIDTH_SIDE = 275
const CARD_HEIGHT_SIDE = 163
const CARD_SPACING = spacing[1] // Reduced spacing between cards

// Visa Logo Component
function VisaLogo({ width = 60, height = 20 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 780 500" fill="none">
      <Path
        d="M489.823 143.111C442.988 143.111 401.134 167.393 401.134 212.256C401.134 263.706 475.364 267.259 475.364 293.106C475.364 303.989 462.895 313.731 441.6 313.731C411.377 313.731 388.789 300.119 388.789 300.119L379.123 345.391C379.123 345.391 405.145 356.889 439.692 356.889C490.898 356.889 531.19 331.415 531.19 285.784C531.19 231.419 456.652 227.971 456.652 203.981C456.652 195.455 466.887 186.114 488.122 186.114C512.081 186.114 531.628 196.014 531.628 196.014L541.087 152.289C541.087 152.289 519.818 143.111 489.823 143.111ZM61.3294 146.411L60.1953 153.011C60.1953 153.011 79.8988 156.618 97.645 163.814C120.495 172.064 122.122 176.868 125.971 191.786L167.905 353.486H224.118L310.719 146.411H254.635L198.989 287.202L176.282 167.861C174.199 154.203 163.651 146.411 150.74 146.411H61.3294ZM333.271 146.411L289.275 353.486H342.756L386.598 146.411H333.271ZM631.554 146.411C618.658 146.411 611.825 153.318 606.811 165.386L528.458 353.486H584.542L595.393 322.136H663.72L670.318 353.486H719.805L676.633 146.411H631.554ZM638.848 202.356L655.473 280.061H610.935L638.848 202.356Z"
        fill="#FFFFFF"
      />
    </Svg>
  )
}

// NFC Icon
function NfcIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/>
      <Path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/>
      <Path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"/>
      <Path d="M16.37 2a20.16 20.16 0 0 1 0 20"/>
    </Svg>
  )
}

// Mock card data
const MOCK_CARDS = [
  {
    id: '1',
    name: 'Card 1',
    last4: '7061',
    cardNumber: '4144 **** **** 7061',
    fullCardNumber: '4144 1234 5678 7061',
    type: 'visa',
    color: 'blue',
    expiryDate: '12/25',
    cvv: '123',
    ownerName: 'SAMUEL ADEYEMI',
  },
  {
    id: '2',
    name: 'Card 2',
    last4: '1234',
    cardNumber: '4111 **** **** 1234',
    fullCardNumber: '4111 2222 3333 1234',
    type: 'visa',
    color: 'purple',
    expiryDate: '09/26',
    cvv: '456',
    ownerName: 'SAMUEL ADEYEMI',
  },
  {
    id: '3',
    name: 'Card 3',
    last4: '5678',
    cardNumber: '4222 **** **** 5678',
    fullCardNumber: '4222 3333 4444 5678',
    type: 'visa',
    color: 'blue',
    expiryDate: '03/27',
    cvv: '789',
    ownerName: 'SAMUEL ADEYEMI',
  },
]

// Mock transactions
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    merchant: 'Apple',
    amount: 1250.00,
        currency: 'USD',
    date: 'Today, 2:40 PM',
    icon: 'monitor',
    status: 'approved',
  },
  {
    id: '2',
    merchant: 'Lidl',
    amount: 124.10,
        currency: 'USD',
    date: 'Yesterday, 6:51 PM',
    icon: 'apple',
    status: 'denied',
  },
  {
    id: '3',
    merchant: 'Amazon',
    amount: 89.50,
        currency: 'USD',
    date: '2 days ago, 10:15 AM',
    icon: 'monitor',
    status: 'reversed',
  },
]

export default function CardScreen({ navigation }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const [selectedCardIndex, setSelectedCardIndex] = useState(0)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})
  const scrollViewRef = useRef<Animated.ScrollView>(null)
  const scrollX = useRef(new Animated.Value(0)).current
  const flipAnimations = useRef<{ [key: number]: Animated.Value }>({})

  const selectedCard = MOCK_CARDS[selectedCardIndex]
  const [copiedCardNumber, setCopiedCardNumber] = useState<string | null>(null)

  const handleCopyCardNumber = async (cardNumber: string, cardId: string) => {
    try {
      await Clipboard.setString(cardNumber)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setCopiedCardNumber(cardId)
      setTimeout(() => {
        setCopiedCardNumber(null)
      }, 2000)
    } catch (error) {
      Alert.alert('Error', 'Failed to copy card number')
    }
  }

  // Initialize flip animations for each card
  MOCK_CARDS.forEach((card, index) => {
    if (!flipAnimations.current[index]) {
      flipAnimations.current[index] = new Animated.Value(0)
    }
  })

  const handleFlipCard = (cardIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const isFlipped = flippedCards[cardIndex] || false
    const toValue = isFlipped ? 0 : 1
    const flipAnim = flipAnimations.current[cardIndex]
    
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start()
    
    setFlippedCards(prev => ({
      ...prev,
      [cardIndex]: !isFlipped,
    }))
  }

  const getCardFlipStyles = (cardIndex: number) => {
    const flipAnim = flipAnimations.current[cardIndex]
    if (!flipAnim) return { front: {}, back: {} }

    const frontInterpolate = flipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    })

    const backInterpolate = flipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    })

    const frontOpacity = flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0],
    })

    const backOpacity = flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    })

    return {
      front: {
        transform: [{ rotateY: frontInterpolate }],
        opacity: frontOpacity,
      },
      back: {
        transform: [{ rotateY: backInterpolate }],
        opacity: backOpacity,
      },
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#10B98120', border: '#10B981', text: '#10B981' }
      case 'denied':
        return { bg: '#EF444420', border: '#EF4444', text: '#EF4444' }
      case 'reversed':
        return { bg: '#F59E0B20', border: '#F59E0B', text: '#F59E0B' }
      default:
        return { bg: '#6B728020', border: '#6B7280', text: '#6B7280' }
    }
  }

  const maskCardNumber = (cardNumber: string) => {
    // Extract last 4 digits from the card number
    // Handle both formats: "4144 **** **** 7061" or "41447061"
    const digits = cardNumber.replace(/\D/g, '')
    if (digits.length >= 4) {
      const last4 = digits.slice(-4)
      // Return masked format: ** 5398
      return `** ${last4}`
    }
    // Fallback if no digits found
    return cardNumber
  }

  const handleCardScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x
        const cardOffset = CARD_WIDTH + CARD_SPACING * 2
        const index = Math.round(offsetX / cardOffset)
        if (index !== selectedCardIndex && index >= 0 && index < MOCK_CARDS.length) {
          setSelectedCardIndex(index)
        }
      },
    }
  )

  const getTransactionIcon = (iconType: string) => {
    switch (iconType) {
      case 'monitor':
        return <Monitor size={16} color={colors.primary.main} strokeWidth={2.5} />
      case 'apple':
        return <Apple size={16} color={colors.primary.main} strokeWidth={2.5} />
      default:
        return <Monitor size={16} color={colors.primary.main} strokeWidth={2.5} />
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const currencySymbol = currency === 'USD' ? '$' : '€'
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

    return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>My Cards</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            // Handle add card
          }}
          activeOpacity={0.7}
        >
          <Plus size={20} color={colors.text.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleCardScroll}
            scrollEventThrottle={16}
            snapToInterval={CARD_WIDTH + CARD_SPACING * 2}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            contentInsetAdjustmentBehavior="never"
          >
            {MOCK_CARDS.map((card, index) => {
              const cardOffset = CARD_WIDTH + CARD_SPACING * 2
              const inputRange = [
                (index - 1) * cardOffset,
                index * cardOffset,
                (index + 1) * cardOffset,
              ]
              
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.96, 1, 0.96], // Even closer to main card (96% scale)
                extrapolate: 'clamp',
              })
              
              const heightScale = scrollX.interpolate({
                inputRange,
                outputRange: [0.96, 1, 0.96], // Even closer to main card (96% scale)
                extrapolate: 'clamp',
              })
              
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.8, 1, 0.8],
                extrapolate: 'clamp',
  })

  return (
        <Animated.View
                  key={card.id}
          style={[
                    styles.cardWrapper,
            {
                      transform: [{ scale }],
                      height: Animated.multiply(CARD_HEIGHT, heightScale),
                      opacity,
            },
          ]}
        >
                  {/* Card Front */}
          <Animated.View
            style={[
              styles.cardFace,
              getCardFlipStyles(index).front,
            ]}
          >
                    <ImageBackground
                      source={require('../../../assets/backgrounds/gradient-background.png')}
                      style={styles.card}
                      imageStyle={styles.cardImage}
                      resizeMode="cover"
                    >
                      {/* Easner Icon - Top Left */}
                      <View style={styles.easnerIconContainer}>
                        <Image
                          source={require('../../../assets/icons/easner icon.png')}
                          style={styles.easnerIcon}
                          resizeMode="contain"
                        />
                      </View>
                  
                      {/* Card Name Badge and NFC Icon - Top Right */}
                      <View style={styles.cardNameAndNfcContainer}>
                        <View style={styles.cardNameBadge}>
                          <Text style={styles.cardNameText}>{card.name}</Text>
                        </View>
                        <View style={styles.nfcIconContainer}>
                          <NfcIcon size={20} />
                        </View>
                      </View>
                  
                      {/* Visa Logo - Bottom Right */}
                      <View style={styles.visaLogoContainer}>
                        <VisaLogo width={70} height={44} />
                      </View>
                  
                      {/* Card Number - Bottom Left */}
                      <View style={styles.cardNumberContainer}>
                        <Text style={styles.cardNumber}>{maskCardNumber(card.cardNumber)}</Text>
                      </View>
                    </ImageBackground>
          </Animated.View>

                  {/* Card Back */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              getCardFlipStyles(index).back,
            ]}
          >
                    <ImageBackground
                      source={require('../../../assets/backgrounds/gradient-background.png')}
                      style={styles.card}
                      imageStyle={styles.cardImage}
                      resizeMode="cover"
                    >
                      {/* Card Back Content */}
                      <View style={styles.cardBackContent}>
                        {/* Owner Name */}
                        <View style={styles.cardBackOwnerContainer}>
                          <Text style={styles.cardBackOwnerName}>{card.ownerName}</Text>
                        </View>

                        {/* Card Number with Copy */}
                        <View style={styles.cardBackNumberContainer}>
                          <Text style={styles.cardBackNumberLabel}>Card Number</Text>
                          <TouchableOpacity
                            style={styles.cardBackNumberRow}
                            onPress={() => handleCopyCardNumber(card.fullCardNumber, card.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.cardBackNumberValue}>{card.fullCardNumber}</Text>
                            {copiedCardNumber === card.id ? (
                              <Check size={16} color={colors.text.inverse} strokeWidth={2.5} />
                            ) : (
                              <Copy size={16} color={colors.text.inverse} strokeWidth={2.5} />
                            )}
                          </TouchableOpacity>
                        </View>

                        {/* Valid and CVV Row */}
                        <View style={styles.cardBackDetailsRow}>
                          <View style={styles.cardBackDetailItem}>
                            <Text style={styles.cardBackLabel}>Valid</Text>
                            <Text style={styles.cardBackDetailValue}>{card.expiryDate}</Text>
                          </View>
                          <View style={styles.cardBackDetailItem}>
                            <Text style={styles.cardBackLabel}>CVV</Text>
                            <Text style={styles.cardBackCvvValue}>{card.cvv}</Text>
                          </View>
                        </View>

                        {/* Visa Logo */}
                        <View style={styles.cardBackLogo}>
                          <VisaLogo width={70} height={44} />
                        </View>
                      </View>
                    </ImageBackground>
                  </Animated.View>
                </Animated.View>
              )
            })}
          </Animated.ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
              <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleFlipCard(selectedCardIndex)}
                activeOpacity={0.7}
              >
            <View style={styles.actionIconContainer}>
              {flippedCards[selectedCardIndex] ? (
                <EyeOff size={20} color={colors.text.primary} strokeWidth={2.5} />
              ) : (
                <Eye size={20} color={colors.text.primary} strokeWidth={2.5} />
              )}
                </View>
            <Text style={styles.actionButtonText}>{flippedCards[selectedCardIndex] ? 'Hide' : 'View'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              // Handle freeze
                }}
                activeOpacity={0.7}
              >
            <View style={styles.actionIconContainer}>
              <Snowflake size={20} color={colors.text.primary} strokeWidth={2.5} />
                </View>
            <Text style={styles.actionButtonText}>Freeze</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              // Handle settings
                }}
                activeOpacity={0.7}
              >
            <View style={styles.actionIconContainer}>
              <Settings size={20} color={colors.text.primary} strokeWidth={2.5} />
                </View>
            <Text style={styles.actionButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
            <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transactions</Text>
              <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('TransactionCard' as never)
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>All</Text>
              <ArrowRight size={14} color={colors.primary.main} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

          {/* Transaction List */}
          {MOCK_TRANSACTIONS.map((transaction) => (
                    <TouchableOpacity
                      key={transaction.id}
                      style={styles.transactionItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('TransactionDetails' as never, { transactionId: transaction.id } as never)
                      }}
                      activeOpacity={0.7}
                    >
              <View style={styles.transactionIconBox}>
                {getTransactionIcon(transaction.icon)}
              </View>
                        <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{transaction.merchant}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                          </View>
              <View style={styles.transactionAmountContainer}>
                <Text style={styles.transactionAmount}>
                  - {formatAmount(transaction.amount, transaction.currency)}
                </Text>
                <Text style={[styles.transactionStatusText, { color: getStatusColor(transaction.status).text }]}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Text>
              </View>
                        </TouchableOpacity>
          ))}
                      </View>
                </ScrollView>
          </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Outfit-Bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing[2],
  },
  carouselContainer: {
    height: CARD_HEIGHT + spacing[8], // Fixed height to prevent layout shifts during card movement
    marginTop: spacing[5],
    marginBottom: spacing[0.5], // Further reduced bottom margin
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2, // Center the first card
    gap: CARD_SPACING * 2,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardFace: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
  },
  cardBack: {
    position: 'absolute',
  },
  cardImage: {
    borderRadius: 24,
  },
  cardBackContent: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'flex-start',
    paddingTop: spacing[8],
  },
  cardBackOwnerContainer: {
    marginBottom: spacing[6],
  },
  cardBackNumberContainer: {
    marginBottom: spacing[6],
    gap: spacing[1],
  },
  cardBackNumberLabel: {
    fontSize: 10,
    color: colors.text.inverse,
    fontFamily: 'Outfit-Medium',
    opacity: 0.8,
  },
  cardBackNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardBackNumberValue: {
    fontSize: 16,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
    letterSpacing: 1,
  },
  cardBackDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
    gap: spacing[4],
  },
  cardBackDetailItem: {
    gap: spacing[1],
  },
  cardBackLabel: {
    fontSize: 10,
    color: colors.text.inverse,
    fontFamily: 'Outfit-Medium',
    opacity: 0.8,
  },
  cardBackDetailValue: {
    fontSize: 14,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  cardBackCvvValue: {
    fontSize: 14,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
    letterSpacing: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  cardBackOwnerName: {
    fontSize: 14,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardBackLogo: {
    alignSelf: 'flex-start',
    marginTop: spacing[4],
  },
  easnerIconContainer: {
    position: 'absolute',
    top: 14,
    left: 5,
    width: 60,
    height: 30,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  easnerIcon: {
    width: 60,
    height: 30,
  },
  cardNameAndNfcContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardNameBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'flex-start',
  },
  cardNameText: {
    fontSize: 10,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  nfcIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visaLogoContainer: {
    position: 'absolute',
    bottom: 5,
    right: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  cardNumberContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    marginTop: spacing[0.5], // Reduced top margin
    marginBottom: spacing[6],
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[2],
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  transactionsSection: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
    backgroundColor: colors.frame.background,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    marginHorizontal: spacing[5],
    marginTop: spacing[4],
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  transactionsTitle: {
    ...textStyles.headingSmall,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: '#B9CAFF',
    borderRadius: borderRadius.full,
  },
  viewAllText: {
    ...textStyles.labelMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  transactionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
    marginBottom: spacing[1],
  },
  transactionDate: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
    gap: spacing[0.5],
  },
  transactionAmount: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionStatusText: {
    ...textStyles.bodySmall,
    fontFamily: 'Outfit-Medium',
  },
})

