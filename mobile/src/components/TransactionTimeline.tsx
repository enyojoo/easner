import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { TransactionData } from '../lib/transactionService'
import { colors, textStyles, borderRadius, spacing } from '../theme'

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
    return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`
  }

  const getStages = (): TimelineStage[] => {
    const status = transaction.status

    const stages: TimelineStage[] = [
      {
        id: 'pending',
        title: 'Initiated',
        description: 'Pending payment confirmation',
        icon: 'arrow-up',
        completed: true,
        timestamp: formatTimestamp(transaction.created_at),
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'Your money is on its way.',
        icon: 'sync',
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
        icon: 'checkmark-circle',
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
      <Text style={styles.timelineTitle}>Transaction Timeline</Text>
      {stages.map((stage, index) => (
        <View key={stage.id} style={styles.stageContainer}>
          {/* Icon and connecting line */}
          <View style={styles.iconContainer}>
            {stage.completed ? (
              <LinearGradient
                colors={colors.success.gradient}
                style={styles.iconCircle}
            >
              <Ionicons
                name={stage.icon as any}
                  size={18}
                  color={colors.text.inverse}
                />
              </LinearGradient>
            ) : (
              <View style={styles.iconCirclePending}>
                <Ionicons
                  name={stage.icon as any}
                  size={18}
                  color={colors.neutral[400]}
              />
            </View>
            )}
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
            {stage.timestamp && (
              <Text style={styles.timestamp}>{stage.timestamp}</Text>
            )}
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
    paddingVertical: spacing[2],
  },
  timelineTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  stageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[5],
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: spacing[4],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCirclePending: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectingLine: {
    width: 2,
    height: 56,
    marginTop: spacing[2],
  },
  connectingLineCompleted: {
    backgroundColor: colors.success.main,
  },
  connectingLinePending: {
    backgroundColor: colors.border.default,
  },
  contentContainer: {
    flex: 1,
    paddingTop: spacing[1],
  },
  title: {
    ...textStyles.titleSmall,
    marginBottom: spacing[1],
  },
  titleCompleted: {
    color: colors.text.primary,
  },
  titlePending: {
    color: colors.text.tertiary,
  },
  timestamp: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  description: {
    ...textStyles.bodyMedium,
  },
  descriptionCompleted: {
    color: colors.text.secondary,
  },
  descriptionPending: {
    color: colors.text.tertiary,
  },
})
