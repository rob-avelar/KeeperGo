import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'

export default function RegisterScreen() {
  const [selectedRole, setSelectedRole] = useState<'ORGANIZER' | 'GOALKEEPER' | null>(null)
  const router = useRouter()

  function handleContinue() {
    if (!selectedRole) return
    router.push({ pathname: '/(auth)/register-details', params: { role: selectedRole } })
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Qual é o seu perfil no KeeperGo?</Text>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, selectedRole === 'ORGANIZER' && styles.cardSelected]}
          onPress={() => setSelectedRole('ORGANIZER')}
        >
          <Text style={styles.cardIcon}>⚽</Text>
          <Text style={[styles.cardTitle, selectedRole === 'ORGANIZER' && styles.cardTitleSelected]}>
            Organizador
          </Text>
          <Text style={styles.cardDesc}>
            Organizo jogos e preciso contratar goleiros para as partidas.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selectedRole === 'GOALKEEPER' && styles.cardSelected]}
          onPress={() => setSelectedRole('GOALKEEPER')}
        >
          <Text style={styles.cardIcon}>🧤</Text>
          <Text style={[styles.cardTitle, selectedRole === 'GOALKEEPER' && styles.cardTitleSelected]}>
            Goleiro
          </Text>
          <Text style={styles.cardDesc}>
            Sou goleiro e quero ser contratado para jogar em partidas.
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, !selectedRole && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!selectedRole}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Já tem conta? <Text style={styles.linkBold}>Entrar</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
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
  cards: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cardSelected: {
    borderColor: '#1a56db',
    backgroundColor: '#eff6ff',
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  cardTitleSelected: {
    color: '#1a56db',
  },
  cardDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  linkBold: {
    color: '#1a56db',
    fontWeight: '600',
  },
})
