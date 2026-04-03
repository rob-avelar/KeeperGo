import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
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
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres.')
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
      const message = err instanceof Error ? err.message : 'Erro ao criar conta.'
      Alert.alert('Erro', message)
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabel = role === 'ORGANIZER' ? 'Organizador' : 'Goleiro'

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Dados do {roleLabel}</Text>
        <Text style={styles.subtitle}>Preencha seus dados para criar a conta.</Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Nome completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          </View>

          <View>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text style={styles.label}>Senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View>
            <Text style={styles.label}>Confirmar senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a senha"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View>
            <Text style={styles.label}>Código de convite (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Se você tem um código"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
              value={inviteCode}
              onChangeText={setInviteCode}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: {
    marginBottom: 24,
  },
  backText: {
    color: '#1a56db',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
