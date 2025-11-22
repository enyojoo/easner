import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps } from '../../types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGet, apiPost, apiPatch } from '../../lib/apiClient'
// Clipboard functionality - using Alert for now

interface BridgeCard {
  id: string
  bridge_card_account_id: string
  card_number: string
  currency: string
  status: string
  balance: number
  last4: string
  expiry: string
  fundingAddress?: string
  fundingChain?: string
  fundingCurrency?: string
  created_at: string
}

interface CardTransaction {
  id: string
  amount: string
  currency: string
  status: string
  type: string
  merchant_name?: string
  created_at: string
  direction: "credit" | "debit"
  description: string
}

function CardContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  
  const [cards, setCards] = useState<BridgeCard[]>([])
  const [selectedCard, setSelectedCard] = useState<BridgeCard | null>(null)
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [loading, setLoading] = useState(false) // Set to false since we're loading from cache
  const [refreshing, setRefreshing] = useState(false)
  const [cardDetailsOpen, setCardDetailsOpen] = useState(false)
  const [cardSettingsOpen, setCardSettingsOpen] = useState(false)
  const [createCardOpen, setCreateCardOpen] = useState(false)
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<CardTransaction | null>(null)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [newCardData, setNewCardData] = useState({
    chain: "stellar",
    currency: "usdc",
    firstName: "",
    lastName: "",
  })

  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `easner_cards_${userProfile.id}`
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    const getCachedCards = async (): Promise<BridgeCard[] | null> => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY)
        if (!cached) return null
        const { value, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          return value
        }
        await AsyncStorage.removeItem(CACHE_KEY)
        return null
      } catch {
        return null
      }
    }

    const setCachedCards = async (value: BridgeCard[]) => {
      try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    // Load from cache first
    const loadFromCache = async () => {
      const cachedCards = await getCachedCards()
      
      // Update state if cache exists
      if (cachedCards !== null && cachedCards.length > 0) {
        setCards(cachedCards)
        if (!selectedCard && cachedCards.length > 0) {
          setSelectedCard(cachedCards[0])
        }
      }

      // If cached and valid, fetch in background to update cache
      if (cachedCards !== null) {
        // Fetch in background
        loadCards(true)
        return
      }

      // Only fetch if no cache
      await loadCards(false)
    }

    loadFromCache()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id])

  useEffect(() => {
    if (selectedCard) {
      loadTransactions(selectedCard.id)
    }
  }, [selectedCard])

  const loadCards = async (background = false) => {
    try {
      if (!background) {
        setLoading(true)
      }
      const response = await apiGet('/api/cards')

      if (response.ok) {
        const data = await response.json()
        const loadedCards = data.cards || []
        setCards(loadedCards)
        
        // Cache cards
        if (userProfile?.id) {
          const CACHE_KEY = `easner_cards_${userProfile.id}`
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            value: loadedCards,
            timestamp: Date.now()
          }))
        }

        // Select first card if available
        if (loadedCards.length > 0 && !selectedCard) {
          setSelectedCard(loadedCards[0])
        } else if (selectedCard) {
          // Update selected card if it still exists
          const updatedCard = loadedCards.find((c: BridgeCard) => c.id === selectedCard.id)
          if (updatedCard) {
            setSelectedCard(updatedCard)
          } else if (loadedCards.length > 0) {
            setSelectedCard(loadedCards[0])
          }
        }
      } else {
        if (!background) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Error loading cards:', response.status, errorData)
          Alert.alert('Error', errorData.error || 'Failed to load cards')
        }
      }
    } catch (error) {
      console.error('Error loading cards:', error)
      if (!background) {
        Alert.alert('Error', 'Failed to load cards. Please check your connection.')
      }
    } finally {
      if (!background) {
        setLoading(false)
      }
    }
  }

  const loadTransactions = async (cardId: string) => {
    try {
      const response = await apiGet(`/api/cards/${cardId}/transactions`)

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      } else {
        console.error('Error loading transactions:', response.status)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCards()
    if (selectedCard) {
      await loadTransactions(selectedCard.id)
    }
    setRefreshing(false)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      // For React Native, we'll use a simple approach
      // In a real app, you'd install @react-native-clipboard/clipboard or expo-clipboard
      // For now, we'll just show visual feedback
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
      // Note: Actual clipboard copy would require installing a package
      // Alert.alert("Copied", "Text copied to clipboard")
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleCreateCard = async () => {
    if (!newCardData.firstName || !newCardData.lastName) {
      Alert.alert("Error", "Please enter first and last name")
      return
    }

    setIsCreatingCard(true)
    try {
      const response = await apiPost('/api/cards', newCardData)

      if (response.ok) {
        const data = await response.json()
        // Reload cards and select the newly created card
        const response2 = await apiGet('/api/cards')
        if (response2.ok) {
          const data2 = await response2.json()
          const loadedCards = data2.cards || []
          setCards(loadedCards)
          
          // Cache cards
          if (userProfile?.id) {
            const CACHE_KEY = `easner_cards_${userProfile.id}`
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
              value: loadedCards,
              timestamp: Date.now()
            }))
          }
          
          // Select the newly created card
          const newCard = loadedCards.find((c: BridgeCard) => c.id === data.card.id)
          if (newCard) {
            setSelectedCard(newCard)
          } else if (loadedCards.length > 0) {
            setSelectedCard(loadedCards[0])
          }
        }
        setCreateCardOpen(false)
        setNewCardData({
          chain: "stellar",
          currency: "usdc",
          firstName: "",
          lastName: "",
        })
      } else {
        const error = await response.json().catch(() => ({}))
        Alert.alert("Error", error.error || "Failed to create card")
      }
    } catch (error) {
      console.error("Error creating card:", error)
      Alert.alert("Error", "Failed to create card")
    } finally {
      setIsCreatingCard(false)
    }
  }

  const handleFreezeToggle = async () => {
    if (!selectedCard) return

    const action = selectedCard.status === "frozen" ? "unfreeze" : "freeze"
    try {
      const response = await apiPatch(`/api/cards/${selectedCard.id}`, { action })

      if (response.ok) {
        // Reload cards to get latest data from Bridge
        const response2 = await apiGet('/api/cards')
        if (response2.ok) {
          const data2 = await response2.json()
          const loadedCards = data2.cards || []
          setCards(loadedCards)
          
          // Update cache
          if (userProfile?.id) {
            const CACHE_KEY = `easner_cards_${userProfile.id}`
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
              value: loadedCards,
              timestamp: Date.now()
            }))
          }
          
          // Update selected card
          const updatedCard = loadedCards.find((c: BridgeCard) => c.id === selectedCard.id)
          if (updatedCard) {
            setSelectedCard(updatedCard)
          }
        }
      } else {
        const error = await response.json().catch(() => ({}))
        Alert.alert("Error", error.error || "Failed to update card")
      }
    } catch (error) {
      console.error("Error updating card:", error)
      Alert.alert("Error", "Failed to update card")
    }
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007ACC" />
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>My Cards</Text>
              <Text style={styles.headerSubtitle}>Manage your virtual debit cards</Text>
            </View>
            {cards.length > 0 && (
              <TouchableOpacity
                style={styles.addCardButton}
                onPress={() => setCreateCardOpen(true)}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addCardButtonText}>Add Card</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cards List */}
        {cards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No Card Yet</Text>
            <Text style={styles.emptySubtext}>Create a card to start spending</Text>
            <TouchableOpacity
              style={styles.addCardButtonEmpty}
              onPress={() => setCreateCardOpen(true)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.addCardButtonText}>Add Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.cardItem,
                  selectedCard?.id === card.id && styles.cardItemSelected,
                ]}
                onPress={() => setSelectedCard(card)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardBalanceSection}>
                      <Text style={styles.balanceLabel}>Balance</Text>
                      <Text style={styles.balanceAmount}>
                        {formatCurrency(card.balance, card.currency)}
                      </Text>
                    </View>
                    <Ionicons name="card" size={32} color="#007ACC" />
                  </View>
                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.cardNumberLabel}>Card Number</Text>
                      <Text style={styles.cardNumber}>**** {card.last4}</Text>
                    </View>
                    {card.expiry && (
                      <View>
                        <Text style={styles.expiryLabel}>Expires</Text>
                        <Text style={styles.expiryValue}>{card.expiry}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Card Actions */}
        {selectedCard && (
          <View style={styles.cardActionsContainer}>
            <TouchableOpacity
              style={styles.cardActionButton}
              onPress={() => setCardDetailsOpen(true)}
            >
              <Ionicons name="eye-outline" size={20} color="#374151" />
              <Text style={styles.cardActionButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardActionButton}
              onPress={() => setCardSettingsOpen(true)}
            >
              <Ionicons name="settings-outline" size={20} color="#374151" />
              <Text style={styles.cardActionButtonText}>Card Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardActionButton}
              onPress={handleFreezeToggle}
            >
              <Ionicons name="snow-outline" size={20} color="#374151" />
              <Text style={styles.cardActionButtonText}>
                {selectedCard.status === "frozen" ? "Unfreeze" : "Freeze"} Card
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transactions */}
        {selectedCard && (
          <View style={styles.transactionsContainer}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.sectionTitle}>Transaction history</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CardTransactions')}
              >
                <Text style={styles.seeAllLink}>See all</Text>
              </TouchableOpacity>
            </View>
            {transactions.length === 0 ? (
              <View style={styles.emptyTransactionsContainer}>
                <Text style={styles.emptyTransactionsText}>No transactions found</Text>
              </View>
            ) : (
              <View style={styles.transactionsList}>
                {transactions.map((transaction) => {
                  const statusColor = transaction.status === "success" || transaction.status === "completed" 
                    ? "#10b981" 
                    : transaction.status === "pending" 
                    ? "#f59e0b" 
                    : "#ef4444"
                  
                  return (
                    <TouchableOpacity
                      key={transaction.id}
                      style={styles.transactionItem}
                      onPress={() => {
                        setSelectedTransaction(transaction)
                        setTransactionDetailsOpen(true)
                      }}
                    >
                      <View style={styles.transactionContent}>
                        <View style={[
                          styles.transactionIcon,
                          transaction.direction === 'credit' ? styles.transactionIconCredit : styles.transactionIconDebit
                        ]}>
                          <Ionicons
                            name={transaction.direction === 'credit' ? 'arrow-down' : 'arrow-up'}
                            size={16}
                            color={transaction.direction === 'credit' ? '#10b981' : '#ef4444'}
                          />
                        </View>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionDescription} numberOfLines={1}>
                            {transaction.description || transaction.merchant_name || 'Transaction'}
                          </Text>
                          <View style={styles.transactionMeta}>
                            <Text style={styles.transactionDate}>{formatDate(transaction.created_at)}</Text>
                            <Text style={styles.transactionSeparator}>•</Text>
                            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                              <Text style={[styles.statusText, { color: statusColor }]}>
                                {transaction.status === "success" || transaction.status === "completed" 
                                  ? "Success" 
                                  : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.transactionAmount,
                            transaction.direction === 'credit' && styles.transactionAmountCredit,
                          ]}
                        >
                          {transaction.direction === 'credit' ? '+' : '-'}
                          {formatCurrency(Math.abs(parseFloat(transaction.amount)), transaction.currency)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        )}

        {/* Card Details Modal */}
        <Modal
          visible={cardDetailsOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setCardDetailsOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Card Details</Text>
                <TouchableOpacity onPress={() => setCardDetailsOpen(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              {selectedCard && (
                <ScrollView style={styles.modalScrollView}>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Card Number</Text>
                    <View style={styles.modalFieldRow}>
                      <Text style={styles.modalValueMono}>**** {selectedCard.last4}</Text>
                      <TouchableOpacity
                        onPress={() => handleCopy(`**** ${selectedCard.last4}`, "cardNumber")}
                      >
                        <Ionicons
                          name={copiedStates.cardNumber ? "checkmark" : "copy-outline"}
                          size={20}
                          color={copiedStates.cardNumber ? "#10b981" : "#6b7280"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {selectedCard.expiry && (
                    <View style={styles.modalField}>
                      <Text style={styles.modalLabel}>Expiry Date</Text>
                      <Text style={styles.modalValue}>{selectedCard.expiry}</Text>
                    </View>
                  )}
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Balance</Text>
                    <Text style={styles.modalValueLarge}>
                      {formatCurrency(selectedCard.balance, selectedCard.currency)}
                    </Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <Text style={styles.modalValue}>{selectedCard.status}</Text>
                  </View>
                  {selectedCard.fundingAddress && (
                    <View style={styles.modalField}>
                      <Text style={styles.modalLabel}>Funding Address (Top-Up)</Text>
                      <View style={styles.modalFieldRow}>
                        <Text style={styles.modalValueMonoSmall} numberOfLines={2}>
                          {selectedCard.fundingAddress}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleCopy(selectedCard.fundingAddress || "", "fundingAddress")}
                        >
                          <Ionicons
                            name={copiedStates.fundingAddress ? "checkmark" : "copy-outline"}
                            size={20}
                            color={copiedStates.fundingAddress ? "#10b981" : "#6b7280"}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.modalHint}>
                        Send {selectedCard.fundingCurrency?.toUpperCase()} on {selectedCard.fundingChain} to fund this card
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Card Settings Modal */}
        <Modal
          visible={cardSettingsOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setCardSettingsOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Card Settings</Text>
                <TouchableOpacity onPress={() => setCardSettingsOpen(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              {selectedCard && (
                <View style={styles.modalScrollView}>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Card Number</Text>
                    <Text style={styles.modalValueMono}>**** {selectedCard.last4}</Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <Text style={styles.modalValue}>{selectedCard.status}</Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <Text style={styles.modalHint}>
                    Card settings and preferences will be available here
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Create Card Modal */}
        <Modal
          visible={createCardOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setCreateCardOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Card</Text>
                <TouchableOpacity onPress={() => setCreateCardOpen(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>First Name *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCardData.firstName}
                    onChangeText={(text) => setNewCardData({ ...newCardData, firstName: text })}
                    placeholder="John"
                  />
                </View>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCardData.lastName}
                    onChangeText={(text) => setNewCardData({ ...newCardData, lastName: text })}
                    placeholder="Doe"
                  />
                </View>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Blockchain *</Text>
                  <TouchableOpacity style={styles.modalSelect}>
                    <Text style={styles.modalSelectText}>
                      {newCardData.chain.charAt(0).toUpperCase() + newCardData.chain.slice(1)}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Currency *</Text>
                  <TouchableOpacity style={styles.modalSelect}>
                    <Text style={styles.modalSelectText}>
                      {newCardData.currency.toUpperCase()}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    (isCreatingCard || !newCardData.firstName || !newCardData.lastName) && styles.modalButtonDisabled
                  ]}
                  onPress={handleCreateCard}
                  disabled={isCreatingCard || !newCardData.firstName || !newCardData.lastName}
                >
                  {isCreatingCard ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Create Card</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Transaction Details Modal */}
        <Modal
          visible={transactionDetailsOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTransactionDetailsOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Transaction Details</Text>
                <TouchableOpacity onPress={() => setTransactionDetailsOpen(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              {selectedTransaction && (
                <View style={styles.modalScrollView}>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Description</Text>
                    <Text style={styles.modalValue}>{selectedTransaction.description}</Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Amount</Text>
                    <Text
                      style={[
                        styles.modalValueLarge,
                        selectedTransaction.direction === 'credit' && styles.modalValueCredit
                      ]}
                    >
                      {selectedTransaction.direction === 'credit' ? '+' : '-'}
                      {formatCurrency(Math.abs(parseFloat(selectedTransaction.amount)), selectedTransaction.currency)}
                    </Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Date</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedTransaction.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <Text style={styles.modalValue}>{selectedTransaction.status}</Text>
                  </View>
                  {selectedTransaction.merchant_name && (
                    <View style={styles.modalField}>
                      <Text style={styles.modalLabel}>Merchant</Text>
                      <Text style={styles.modalValue}>{selectedTransaction.merchant_name}</Text>
                    </View>
                  )}
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Type</Text>
                    <Text style={styles.modalValue}>{selectedTransaction.type}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  )
}

const CardScreen = ({ navigation }: NavigationProps) => {
  return <CardContent navigation={navigation} />
}

export default CardScreen

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007ACC', // Brand primary color
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addCardButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  addCardButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007ACC', // Brand primary color
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  cardsContainer: {
    padding: 20,
    gap: 12,
  },
  cardItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cardItemSelected: {
    borderColor: '#007ACC',
    shadowColor: '#007ACC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    gap: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBalanceSection: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cardNumberLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1f2937',
  },
  expiryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  expiryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  cardActionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cardActionButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  transactionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  seeAllLink: {
    fontSize: 16,
    color: '#007ACC',
    fontWeight: '500',
  },
  emptyTransactionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: '#6b7280',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconCredit: {
    backgroundColor: '#d1fae5',
  },
  transactionIconDebit: {
    backgroundColor: '#fee2e2',
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionSeparator: {
    fontSize: 12,
    color: '#d1d5db',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontVariant: ['tabular-nums'],
  },
  transactionAmountCredit: {
    color: '#10b981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalScrollView: {
    padding: 20,
  },
  modalField: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  modalValue: {
    fontSize: 14,
    color: '#111827',
  },
  modalValueMono: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#111827',
  },
  modalValueMonoSmall: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#111827',
    flex: 1,
  },
  modalValueLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalValueCredit: {
    color: '#10b981',
  },
  modalFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  modalSelectText: {
    fontSize: 16,
    color: '#111827',
  },
  modalButton: {
    backgroundColor: '#007ACC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
})

