import React from "react"
import { SafeAreaView, Text, View } from "react-native"

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Profile</Text>
        <Text>View and edit your profile.</Text>
      </View>
    </SafeAreaView>
  )
}

