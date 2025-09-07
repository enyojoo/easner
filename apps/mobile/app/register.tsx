import React, { useState } from "react"
import { useRouter, Link } from "expo-router"
import { SafeAreaView, Text, TextInput, View, Button } from "react-native"

export default function RegisterScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async () => {
    // TODO: wire to Supabase
    router.replace("/login")
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Register</Text>
        <TextInput placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
        <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
        <Button title="Create account" onPress={handleRegister} />
        <Link href="/login">Back to login</Link>
      </View>
    </SafeAreaView>
  )
}

