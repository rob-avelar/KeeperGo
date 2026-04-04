import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native'
import { useQuery, useMutation } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { apiClient } from '@/lib/api'

export default function BankSetupScreen() {
  const [isConnecting, setIsConnecting] = useState(false)

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['stripe-status'],
    queryFn: () => apiClient.getStripeAccountStatus(),
  })

  async function handleConnectStripe() {
    setIsConnecting(true)
    try {
      await apiClient.createStripeAccount().catch(() => {
        // Account may already exist — ignore error
      })

      const { url } = await apiClient.getStripeAccountLink(
        'keepergo://bank-setup',
        'keepergo://bank-setup',
      )

      const result = await WebBrowser.openAuthSessionAsync(url, 'keepergo://bank-setup')

      if (result.type === 'success') {
        await refetch()
        Alert.alert('Account Connected!', 'Your bank account is set up. You can now receive payments.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect with Stripe.'
      Alert.alert('Error', msg)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator color="#a3e635" size="large" />
      </View>
    )
  }

  const isFullySetup = status?.chargesEnabled && status?.payoutsEnabled

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Payment Setup</Text>
      <Text style={styles.subtitle}>
        To receive payments for your matches, connect your bank account via Stripe.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Account Status</Text>
        <StatusRow label="Account created" ok={status?.detailsSubmitted ?? false} />
        <StatusRow label="Receive payments" ok={status?.chargesEnabled ?? false} />
        <StatusRow label="Payouts enabled" ok={status?.payoutsEnabled ?? false} />
      </View>

      {isFullySetup ? (
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>All set!</Text>
          <Text style={styles.successText}>
            You're ready to receive payments for your matches.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How does it work?</Text>
            <Text style={styles.infoItem}>1. Click "Connect Bank Account"</Text>
            <Text style={styles.infoItem}>2. Complete the Stripe onboarding (secure & encrypted)</Text>
            <Text style={styles.infoItem}>3. After approval, payments are automatic</Text>
            <Text style={styles.infoItem}>4. Receive payouts 2-7 business days after each match</Text>
          </View>

          <TouchableOpacity
            style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
            onPress={handleConnectStripe}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <Text style={styles.connectButtonText}>
                {status?.detailsSubmitted ? 'Continue Setup' : 'Connect Bank Account'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.stripe}>
            Securely processed by{' '}
            <Text style={styles.stripeLink} onPress={() => Linking.openURL('https://stripe.com')}>
              Stripe
            </Text>
          </Text>
        </>
      )}
    </ScrollView>
  )
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={ok ? styles.statusOk : styles.statusPending}>
        {ok ? '✓ OK' : '○ Pending'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#9ca3af', lineHeight: 22, marginBottom: 24 },
  statusCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#d1d5db', marginBottom: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#374151' },
  statusLabel: { fontSize: 14, color: '#9ca3af' },
  statusOk: { fontSize: 14, color: '#a3e635', fontWeight: '600' },
  statusPending: { fontSize: 14, color: '#6b7280' },
  successCard: {
    backgroundColor: '#1a2410',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a3e635',
  },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#a3e635', marginBottom: 8 },
  successText: { fontSize: 14, color: '#d1d5db', textAlign: 'center', lineHeight: 20 },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#d1d5db', marginBottom: 10 },
  infoItem: { fontSize: 13, color: '#9ca3af', lineHeight: 24 },
  connectButton: {
    backgroundColor: '#a3e635',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  connectButtonDisabled: { opacity: 0.6 },
  connectButtonText: { color: '#111827', fontSize: 16, fontWeight: '700' },
  stripe: { textAlign: 'center', fontSize: 12, color: '#6b7280' },
  stripeLink: { color: '#a3e635', textDecorationLine: 'underline' },
})
