import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useStripe } from '@stripe/stripe-react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export default function PayScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  const [isPaying, setIsPaying] = useState(false)
  const router = useRouter()

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => apiClient.getBookings().then((bs) => bs.find((b) => b.id === bookingId)),
  })

  async function handlePay() {
    if (!booking) return
    setIsPaying(true)
    try {
      const { clientSecret } = await apiClient.createPayment(bookingId)

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'KeeperGo',
        defaultBillingDetails: {},
      })

      if (initError) {
        Alert.alert('Erro', initError.message)
        return
      }

      const { error: paymentError } = await presentPaymentSheet()

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Pagamento falhou', paymentError.message)
        }
        return
      }

      // Confirmar pagamento na API
      await apiClient.confirmPayment(bookingId, clientSecret.split('_secret')[0])

      Alert.alert('Pagamento confirmado! 🎉', 'Sua reserva foi paga com sucesso.', [
        { text: 'OK', onPress: () => router.replace('/(organizer)/dashboard') },
      ])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar pagamento.'
      Alert.alert('Erro', msg)
    } finally {
      setIsPaying(false)
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1a56db" size="large" />
      </View>
    )
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Reserva não encontrada.</Text>
      </View>
    )
  }

  const date = new Date(booking.date)
  const canPay = booking.status === 'ACCEPTED'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Resumo da reserva</Text>

      <View style={styles.card}>
        <Row label="Data" value={date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} />
        <Row label="Horário" value={date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} />
        <Row label="Local" value={booking.location} />
        {booking.goalkeeper && <Row label="Goleiro" value={booking.goalkeeper.name} />}
        <Row label="Duração" value={`${booking.duration} minutos`} />
        <View style={styles.divider} />
        <Row label="Valor/hora" value={`€${booking.pricePerHour.toFixed(2)}`} />
        <Row label="Taxa plataforma" value={`€${booking.platformFee.toFixed(2)}`} small />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>€{booking.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: canPay ? '#dcfce7' : '#fef3c7' }]}>
        <Text style={[styles.statusText, { color: canPay ? '#16a34a' : '#d97706' }]}>
          {canPay ? '✓ Goleiro aceitou — pronto para pagar' : `Status: ${booking.status}`}
        </Text>
      </View>

      {canPay && (
        <TouchableOpacity
          style={[styles.payButton, isPaying && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={isPaying}
        >
          {isPaying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pagar €{booking.totalAmount.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/(organizer)/dashboard')}
      >
        <Text style={styles.backButtonText}>Voltar ao início</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function Row({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, small && { color: '#9ca3af' }]}>{label}</Text>
      <Text style={[styles.rowValue, small && { color: '#9ca3af' }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: '#6b7280' },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 12 },
  divider: { height: 1, backgroundColor: '#e5e7eb' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#1a56db' },
  statusBadge: { borderRadius: 12, padding: 14, marginBottom: 20 },
  statusText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  payButton: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButtonText: { color: '#6b7280', fontSize: 16 },
})
