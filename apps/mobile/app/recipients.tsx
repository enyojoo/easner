import React from "react"
import { SafeAreaView, Text, View } from "react-native"

export default function RecipientsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Recipients</Text>
        <Text>Manage your recipients.</Text>
      </View>
    </SafeAreaView>
  )
}

