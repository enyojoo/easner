import React, { useState } from "react"
import { useRouter } from "expo-router"
import { SafeAreaView, Text, TextInput, View, Button } from "react-native"

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  const handleReset = async () => {
    // TODO: wire to Supabase reset
    router.back()
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Forgot password</Text>
        <TextInput placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
        <Button title="Send reset link" onPress={handleReset} />
      </View>
    </SafeAreaView>
  )
}

