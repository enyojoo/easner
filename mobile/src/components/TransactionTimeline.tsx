import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TransactionData } from '../lib/transactionService'

interface TimelineStage {
  id: string
  title: string
  description: string
  icon: string
  completed: boolean
  timestamp: string
}

interface TransactionTimelineProps {
  transaction: TransactionData
}

export function TransactionTimeline({ transaction }: TransactionTimelineProps) {
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString('en-US', { month: 'short' })
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    // Format: "Nov 05, 2025 • 2:22 PM"
    return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`
  }

  const getStages = (): TimelineStage[] => {
    const status = transaction.status

    const stages: TimelineStage[] = [
      {
        id: 'initiated',
        title: 'Initiated',
        description: 'You made this transaction',
        icon: 'arrow-up',
        completed: true,
        timestamp: formatTimestamp(transaction.created_at),
      },
      {
        id: 'sent',
        title: 'Sent',
        description: 'Your transaction is on its way.',
        icon: 'arrow-forward',
        completed: status === 'processing' || status === 'completed',
        timestamp:
          status === 'processing' || status === 'completed'
            ? formatTimestamp(transaction.updated_at)
            : '',
      },
      {
        id: 'completed',
        title: 'Completed',
        description: transaction.recipient?.bank_name
          ? `${transaction.recipient.bank_name} received your transaction.`
          : 'Transaction completed successfully.',
        icon: 'checkmark',
        completed: status === 'completed',
        timestamp:
          status === 'completed'
            ? formatTimestamp(transaction.completed_at || transaction.updated_at)
            : '',
      },
    ]

    return stages
  }

  const stages = getStages()

  return (
    <View style={styles.container}>
      {stages.map((stage, index) => (
        <View key={stage.id} style={styles.stageContainer}>
          {/* Icon and connecting line */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                stage.completed ? styles.iconCircleCompleted : styles.iconCirclePending,
              ]}
            >
              <Ionicons
                name={stage.icon as any}
                size={20}
                color={stage.completed ? '#ffffff' : '#9ca3af'}
              />
            </View>
            {/* Connecting Line */}
            {index < stages.length - 1 && (
              <View
                style={[
                  styles.connectingLine,
                  stage.completed ? styles.connectingLineCompleted : styles.connectingLinePending,
                ]}
              />
            )}
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, stage.completed ? styles.titleCompleted : styles.titlePending]}>
              {stage.title}
            </Text>
            {stage.timestamp && <Text style={styles.timestamp}>{stage.timestamp}</Text>}
            <Text style={[styles.description, stage.completed ? styles.descriptionCompleted : styles.descriptionPending]}>
              {stage.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  stageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  iconCirclePending: {
    backgroundColor: '#e5e7eb',
    borderColor: '#d1d5db',
  },
  connectingLine: {
    width: 2,
    height: 48,
    marginTop: 8,
  },
  connectingLineCompleted: {
    backgroundColor: '#10b981',
  },
  connectingLinePending: {
    backgroundColor: '#d1d5db',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleCompleted: {
    color: '#ffffff',
  },
  titlePending: {
    color: '#9ca3af',
  },
  timestamp: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  descriptionCompleted: {
    color: '#ffffff',
  },
  descriptionPending: {
    color: '#6b7280',
  },
})

