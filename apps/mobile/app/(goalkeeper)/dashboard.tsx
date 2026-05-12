import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { Booking } from '@keepergo/shared-types'

function PendingBookingCard({
  booking,
  onAccept,
  onReject,
}: {
  booking: Booking
  onAccept: () => void
  onReject: () => void
}) {
  const date = new Date(booking.date)
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>New Request</Text>
        </View>
      </View>
      <Text style={styles.cardOrganizer}>Organizer: {booking.organizer.name}</Text>
      <Text style={styles.cardLocation} numberOfLines={1}>{booking.location}</Text>
      <Text style={styles.cardDuration}>{booking.duration} min · €{(booking.goalkeeperEarnings ?? 0).toFixed(2)}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
          <Text style={styles.rejectBtnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={onAccept}>
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const date = new Date(booking.date)
  const statusColors: Record<string, string> = {
    ACCEPTED: '#a3e635',
    CONFIRMED: '#a3e635',
    COMPLETED: '#6b7280',
    CANCELLED: '#ef4444',
  }
  const statusLabels: Record<string, string> = {
    ACCEPTED: 'Accepted',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }
  const color = statusColors[booking.status] ?? '#6b7280'
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.statusText, { color }]}>{statusLabels[booking.status] ?? booking.status}</Text>
        </View>
      </View>
      <Text style={styles.cardLocation} numberOfLines={1}>{booking.location}</Text>
      <Text style={styles.cardEarnings}>Earnings: €{(booking.goalkeeperEarnings ?? 0).toFixed(2)}</Text>
    </View>
  )
}

export default function GoalkeeperDashboard() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    data: bookings,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['goalkeeper-bookings'],
    queryFn: () => apiClient.getBookings(),
  })

  const { mutate: accept } = useMutation({
    mutationFn: (id: string) => apiClient.acceptBooking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalkeeper-bookings'] }),
    onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to accept.'),
  })

  const { mutate: reject } = useMutation({
    mutationFn: (id: string) => apiClient.rejectBooking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalkeeper-bookings'] }),
    onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to decline.'),
  })

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') ?? []
  const activeBookings = bookings?.filter((b) => ['ACCEPTED', 'CONFIRMED'].includes(b.status)) ?? []
  const completedCount = bookings?.filter((b) => b.status === 'COMPLETED').length ?? 0
  const totalEarned = bookings
    ?.filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.goalkeeperEarnings ?? 0), 0) ?? 0

  function handleAccept(id: string) {
    Alert.alert('Accept Booking?', 'You commit to showing up for this match.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => accept(id) },
    ])
  }

  function handleReject(id: string) {
    Alert.alert('Decline Booking?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => reject(id) },
    ])
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a3e635" />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 🧤</Text>
        <Text style={styles.subgreeting}>Your upcoming matches</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Matches Played</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>€{totalEarned.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingBookings.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#a3e635" style={{ marginTop: 32 }} />
      ) : (
        <>
          {pendingBookings.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>⚡ Pending Requests</Text>
              {pendingBookings.map((b) => (
                <PendingBookingCard
                  key={b.id}
                  booking={b}
                  onAccept={() => handleAccept(b.id)}
                  onReject={() => handleReject(b.id)}
                />
              ))}
            </>
          )}

          {activeBookings.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>📅 Upcoming Matches</Text>
              {activeBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
            </>
          )}

          {pendingBookings.length === 0 && activeBookings.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧤</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>Complete your profile to appear in searches!</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  subgreeting: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#a3e635' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 12, marginTop: 8 },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#d1d5db' },
  pendingBadge: { backgroundColor: '#f59e0b20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  pendingBadgeText: { fontSize: 12, color: '#f59e0b', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardOrganizer: { fontSize: 14, color: '#d1d5db', marginBottom: 4 },
  cardLocation: { fontSize: 13, color: '#9ca3af', marginBottom: 4 },
  cardDuration: { fontSize: 14, fontWeight: '600', color: '#a3e635', marginBottom: 12 },
  cardEarnings: { fontSize: 14, fontWeight: '600', color: '#a3e635' },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#a3e635' },
  acceptBtnText: { color: '#111827', fontWeight: '700', fontSize: 14 },
  rejectBtn: { backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#ef4444' },
  rejectBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
})
