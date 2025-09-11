import React from 'react'
import { View, StyleSheet } from 'react-native'
import ScreenWrapper from './ScreenWrapper'
import SkeletonLoader from './SkeletonLoader'

const DashboardSkeleton: React.FC = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <SkeletonLoader width={200} height={32} borderRadius={8} />
          <SkeletonLoader width={40} height={40} borderRadius={20} />
        </View>

        {/* Stats Cards Skeleton */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.totalSentCard]}>
            <SkeletonLoader width="80%" height={48} borderRadius={8} style={styles.statNumber} />
            <SkeletonLoader width="60%" height={20} borderRadius={4} style={styles.statLabel} />
          </View>
          <View style={[styles.statCard, styles.transactionsCard]}>
            <SkeletonLoader width="60%" height={48} borderRadius={8} style={styles.statNumber} />
            <SkeletonLoader width="70%" height={20} borderRadius={4} style={styles.statLabel} />
          </View>
        </View>

        {/* Quick Actions Skeleton */}
        <View style={styles.quickActions}>
          <View style={styles.actionButton}>
            <SkeletonLoader width="80%" height={20} borderRadius={4} />
          </View>
          <View style={styles.actionButton}>
            <SkeletonLoader width="80%" height={20} borderRadius={4} />
          </View>
        </View>

        {/* Recent Transactions Skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SkeletonLoader width={150} height={24} borderRadius={4} />
            <SkeletonLoader width={60} height={20} borderRadius={4} />
          </View>
          
          {/* Transaction Items Skeleton */}
          {[1, 2, 3].map((index) => (
            <View key={index} style={styles.transactionItem}>
              {/* Transaction Header */}
              <View style={styles.transactionHeader}>
                <SkeletonLoader width="60%" height={16} borderRadius={4} />
                <SkeletonLoader width={80} height={24} borderRadius={12} />
              </View>

              {/* Recipient Section */}
              <View style={styles.recipientSection}>
                <SkeletonLoader width={20} height={12} borderRadius={4} style={styles.recipientLabel} />
                <SkeletonLoader width="70%" height={20} borderRadius={4} style={styles.recipientName} />
              </View>

              {/* Amount Section */}
              <View style={styles.amountSection}>
                <View style={styles.amountRow}>
                  <SkeletonLoader width={80} height={12} borderRadius={4} />
                  <SkeletonLoader width={100} height={16} borderRadius={4} />
                </View>
                <View style={styles.amountRow}>
                  <SkeletonLoader width={100} height={12} borderRadius={4} />
                  <SkeletonLoader width={100} height={16} borderRadius={4} />
                </View>
              </View>

              {/* Footer */}
              <View style={styles.transactionFooter}>
                <SkeletonLoader width={120} height={12} borderRadius={4} />
                <SkeletonLoader width={20} height={16} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalSentCard: {
    flex: 1.5,
    padding: 20,
  },
  transactionsCard: {
    flex: 1,
    padding: 20,
  },
  statNumber: {
    marginBottom: 8,
  },
  statLabel: {
    marginTop: 4,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipientSection: {
    marginBottom: 16,
  },
  recipientLabel: {
    marginBottom: 8,
  },
  recipientName: {
    marginTop: 4,
  },
  amountSection: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
})

export default DashboardSkeleton
