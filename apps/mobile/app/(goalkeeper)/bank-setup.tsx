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
      // Garante que a conta existe
      await apiClient.createStripeAccount().catch(() => {
        // Pode já existir — ignora o erro
      })

      // Obtém link de onboarding
      const { url } = await apiClient.getStripeAccountLink(
        'keepergo://bank-setup',
        'keepergo://bank-setup',
      )

      // Abre no browser in-app
      const result = await WebBrowser.openAuthSessionAsync(url, 'keepergo://bank-setup')

      if (result.type === 'success') {
        await refetch()
        Alert.alert('Sucesso!', 'Conta bancária configurada. Você já pode receber pagamentos.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao conectar com Stripe.'
      Alert.alert('Erro', msg)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1a56db" size="large" />
      </View>
    )
  }

  const isFullySetup = status?.chargesEnabled && status?.payoutsEnabled

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Configuração de pagamentos</Text>
      <Text style={styles.subtitle}>
        Para receber pelos seus jogos, conecte sua conta bancária via Stripe.
      </Text>

      {/* Status atual */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Status da conta</Text>
        <StatusRow label="Conta criada" ok={status?.detailsSubmitted ?? false} />
        <StatusRow label="Receber pagamentos" ok={status?.chargesEnabled ?? false} />
        <StatusRow label="Saques habilitados" ok={status?.payoutsEnabled ?? false} />
      </View>

      {isFullySetup ? (
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Tudo configurado!</Text>
          <Text style={styles.successText}>
            Você está pronto para receber pagamentos pelos seus jogos.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Como funciona?</Text>
            <Text style={styles.infoItem}>1. Clique em "Conectar conta bancária"</Text>
            <Text style={styles.infoItem}>2. Complete o cadastro no Stripe (seguro e criptografado)</Text>
            <Text style={styles.infoItem}>3. Após aprovação, os pagamentos são automáticos</Text>
            <Text style={styles.infoItem}>4. Você recebe em 2-7 dias úteis após cada jogo</Text>
          </View>

          <TouchableOpacity
            style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
            onPress={handleConnectStripe}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.connectButtonText}>
                {status?.detailsSubmitted ? 'Continuar configuração' : 'Conectar conta bancária'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.stripe}>
            Processado com segurança por{' '}
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
        {ok ? '✓ OK' : '○ Pendente'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 22, marginBottom: 24 },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  statusLabel: { fontSize: 14, color: '#374151' },
  statusOk: { fontSize: 14, color: '#10b981', fontWeight: '600' },
  statusPending: { fontSize: 14, color: '#9ca3af' },
  successCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#15803d', marginBottom: 8 },
  successText: { fontSize: 14, color: '#166534', textAlign: 'center', lineHeight: 20 },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1e40af', marginBottom: 10 },
  infoItem: { fontSize: 13, color: '#1e3a8a', lineHeight: 24 },
  connectButton: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  connectButtonDisabled: { opacity: 0.6 },
  connectButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  stripe: { textAlign: 'center', fontSize: 12, color: '#9ca3af' },
  stripeLink: { color: '#1a56db', textDecorationLine: 'underline' },
})
