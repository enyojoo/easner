import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PasswordInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  style?: any
  containerStyle?: any
}

export default function PasswordInput({ 
  value, 
  onChangeText, 
  placeholder = "Enter password",
  style,
  containerStyle 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        passwordRules="minlength: 6;"
        importantForAutofill="yes"
        underlineColorAndroid="transparent"
        selectionColor="#007ACC"
        placeholderTextColor="#9ca3af"
        returnKeyType="done"
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setShowPassword(!showPassword)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={showPassword ? 'eye-off' : 'eye'}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    color: '#1f2937',
    minHeight: 20,
    ...(Platform.OS === 'android' && {
      paddingVertical: 12,
    }),
  },
  eyeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
