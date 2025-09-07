import React from "react"
import { Link } from "expo-router"
import { SafeAreaView, Text, View } from "react-native"

export default function DashboardScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Easner</Text>
        <Text>Dashboard</Text>
        <View style={{ gap: 8 }}>
          <Link href="/send">Send</Link>
          <Link href="/recipients">Recipients</Link>
          <Link href="/transactions">Transactions</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/support">Support</Link>
        </View>
      </View>
    </SafeAreaView>
  )
}

