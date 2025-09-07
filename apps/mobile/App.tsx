import React from "react"
import { SafeAreaView, Text, View } from "react-native"
import { StatusBar } from "expo-status-bar"

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Easner Mobile</Text>
        <Text>Welcome! We'll wire Supabase and shared logic next.</Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  )
}

