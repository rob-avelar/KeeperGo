import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'

export default function RegisterDetailsScreen() {
  const { role } = useLocalSearchParams<{ role: 'ORGANIZER' | 'GOALKEEPER' }>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuthStore()
  const router = useRouter()

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Required', 'Please fill in all required fields.')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.')
      return
    }
    setIsLoading(true)
    try {
      await apiClient.signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role as 'ORGANIZER' | 'GOALKEEPER',
        inviteCode: inviteCode.trim() || undefined,
      })
      await signIn(email.trim().toLowerCase(), password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      Alert.alert('Error', message)
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabel = role === 'ORGANIZER' ? 'Organizer' : 'Goalkeeper'

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{roleLabel} Account</Text>
        <Text style={styles.subtitle}>Fill in your details to get started.</Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Full name *</Text>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#6b7280"
              value={name} onChangeText={setName} autoComplete="name" />
          </View>
          <View>
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor="#6b7280"
              keyboardType="email-address" autoCapitalize="none" autoComplete="email"
              value={email} onChangeText={setEmail} />
          </View>
          <View>
            <Text style={styles.label}>Password *</Text>
            <TextInput style={styles.input} placeholder="Minimum 8 characters" placeholderTextColor="#6b7280"
              secureTextEntry value={password} onChangeText={setPassword} />
          </View>
          <View>
            <Text style={styles.label}>Confirm password *</Text>
            <TextInput style={styles.input} placeholder="Repeat your password" placeholderTextColor="#6b7280"
              secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          </View>
          <View>
            <Text style={styles.label}>Invite code (optional)</Text>
            <TextInput style={styles.input} placeholder="If you have one" placeholderTextColor="#6b7280"
              autoCapitalize="characters" value={inviteCode} onChangeText={setInviteCode} />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister} disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111827', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 24 },
  backText: { color: '#a3e635', fontSize: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#9ca3af', marginBottom: 32 },
  form: { gap: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#d1d5db', marginBottom: 8 },
  input: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
  },
  button: { backgroundColor: '#a3e635', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#111827', fontSize: 16, fontWeight: '700' },
})
