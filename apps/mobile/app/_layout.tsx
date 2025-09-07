import React from "react"
import { Stack } from "expo-router"

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="login" options={{ title: "Login", presentation: "card" }} />
      <Stack.Screen name="register" options={{ title: "Register", presentation: "card" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Forgot Password", presentation: "card" }} />
      <Stack.Screen name="send" options={{ title: "Send" }} />
      <Stack.Screen name="recipients" options={{ title: "Recipients" }} />
      <Stack.Screen name="transactions" options={{ title: "Transactions" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="support" options={{ title: "Support" }} />
    </Stack>
  )
}

