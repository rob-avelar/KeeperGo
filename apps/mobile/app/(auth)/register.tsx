import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
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
      <View style={styles.logoRow}>
        <Text style={styles.logoIcon}>⚽</Text>
        <Text style={styles.logo}>KeeperGo</Text>
      </View>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>What's your role on KeeperGo?</Text>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, selectedRole === 'ORGANIZER' && styles.cardSelected]}
          onPress={() => setSelectedRole('ORGANIZER')}
        >
          <Text style={styles.cardIcon}>⚽</Text>
          <Text style={[styles.cardTitle, selectedRole === 'ORGANIZER' && styles.cardTitleSelected]}>
            Organizer
          </Text>
          <Text style={styles.cardDesc}>
            I organize matches and need to book goalkeepers for my team.
          </Text>
          {selectedRole === 'ORGANIZER' && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>✓ Selected</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selectedRole === 'GOALKEEPER' && styles.cardSelected]}
          onPress={() => setSelectedRole('GOALKEEPER')}
        >
          <Text style={styles.cardIcon}>🧤</Text>
          <Text style={[styles.cardTitle, selectedRole === 'GOALKEEPER' && styles.cardTitleSelected]}>
            Goalkeeper
          </Text>
          <Text style={styles.cardDesc}>
            I'm a goalkeeper and want to get booked for amateur football matches.
          </Text>
          {selectedRole === 'GOALKEEPER' && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>✓ Selected</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, !selectedRole && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!selectedRole}
      >
        <Text style={styles.buttonText}>Continue →</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111827', paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 24, marginRight: 6 },
  logo: { fontSize: 28, fontWeight: '800', color: '#a3e635' },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#9ca3af', marginBottom: 32 },
  cards: { gap: 16, marginBottom: 32 },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#374151',
  },
  cardSelected: { borderColor: '#a3e635', backgroundColor: '#1a2410' },
  cardIcon: { fontSize: 36, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  cardTitleSelected: { color: '#a3e635' },
  cardDesc: { fontSize: 14, color: '#9ca3af', lineHeight: 20 },
  selectedBadge: {
    marginTop: 12,
    backgroundColor: '#a3e635',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  selectedBadgeText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  button: {
    backgroundColor: '#a3e635',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { backgroundColor: '#374151' },
  buttonText: { color: '#111827', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', color: '#6b7280', fontSize: 14 },
  linkBold: { color: '#a3e635', fontWeight: '600' },
})
