import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { colors, textStyles, spacing, borderRadius } from '../theme'

interface ExternalLinkModalProps {
  visible: boolean
  url: string
  title?: string
  onClose: () => void
}

export default function ExternalLinkModal({
  visible,
  url,
  title,
  onClose,
}: ExternalLinkModalProps) {
  const [loading, setLoading] = useState(true)

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.modalBackButton, { color: colors.primary.main }]}>Back</Text>
          </TouchableOpacity>
          {title && (
            <Text style={styles.modalTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        )}
        <WebView
          source={{ uri: url }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent
            console.warn('[ExternalLinkModal] HTTP error:', nativeEvent.statusCode, nativeEvent.url)
            setLoading(false)
          }}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalBackButton: {
    ...textStyles.titleLarge,
    fontWeight: '600',
  },
  modalTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 1,
  },
  webView: {
    flex: 1,
  },
})

