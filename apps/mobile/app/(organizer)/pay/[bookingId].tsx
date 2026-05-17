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
        Alert.alert('Error', initError.message)
        return
      }

      const { error: paymentError } = await presentPaymentSheet()

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', paymentError.message)
        }
        return
      }

      await apiClient.confirmPayment(bookingId, clientSecret.split('_secret')[0])

      Alert.alert('Payment Confirmed! 🎉', 'Your booking has been paid successfully.', [
        { text: 'OK', onPress: () => router.replace('/(organizer)/dashboard') },
      ])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process payment.'
      Alert.alert('Error', msg)
    } finally {
      setIsPaying(false)
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator color="#a3e635" size="large" />
      </View>
    )
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#111827' }}>
        <Text style={{ fontSize: 16, color: '#9ca3af' }}>Booking not found.</Text>
      </View>
    )
  }

  const date = new Date(booking.date)
  const canPay = booking.status === 'ACCEPTED'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Booking Summary</Text>

      <View style={styles.card}>
        <Row label="Date" value={date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} />
        <Row label="Time" value={date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} />
        <Row label="Location" value={booking.location} />
        {booking.goalkeeper && <Row label="Goalkeeper" value={booking.goalkeeper.name} />}
        <Row label="Duration" value={`${booking.duration} minutes`} />
        <View style={styles.divider} />
        <Row label="Rate/hour" value={`€${((booking.pricePerHour ?? 0) / 100).toFixed(2)}`} />
        <Row label="Platform fee" value={`€${((booking.platformFee ?? 0) / 100).toFixed(2)}`} small />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>€{((booking.totalAmount ?? 0) / 100).toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: canPay ? '#1a2410' : '#1c1508' }]}>
        <Text style={[styles.statusText, { color: canPay ? '#a3e635' : '#f59e0b' }]}>
          {canPay ? '✓ Goalkeeper accepted — ready to pay' : `Status: ${booking.status}`}
        </Text>
      </View>

      {canPay && (
        <TouchableOpacity
          style={[styles.payButton, isPaying && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={isPaying}
        >
          {isPaying ? (
            <ActivityIndicator color="#111827" />
          ) : (
            <Text style={styles.payButtonText}>Pay €{((booking.totalAmount ?? 0) / 100).toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/(organizer)/dashboard')}
      >
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function Row({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, small && { color: '#6b7280' }]}>{label}</Text>
      <Text style={[styles.rowValue, small && { color: '#6b7280' }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginBottom: 20 },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: '#9ca3af' },
  rowValue: { fontSize: 14, color: '#ffffff', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 12 },
  divider: { height: 1, backgroundColor: '#374151' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#a3e635' },
  statusBadge: { borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#374151' },
  statusText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  payButton: {
    backgroundColor: '#a3e635',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#111827', fontSize: 18, fontWeight: '700' },
  backButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  backButtonText: { color: '#9ca3af', fontSize: 16 },
})
