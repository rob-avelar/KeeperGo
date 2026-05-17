import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { Booking } from '@keepergo/shared-types'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
  NO_SHOW: 'No Show',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  ACCEPTED: '#a3e635',
  CONFIRMED: '#a3e635',
  COMPLETED: '#6b7280',
  CANCELLED: '#ef4444',
  REJECTED: '#ef4444',
  NO_SHOW: '#7c3aed',
}

function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const date = new Date(booking.date)
  const statusColor = STATUS_COLORS[booking.status] ?? '#6b7280'
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {STATUS_LABELS[booking.status] ?? booking.status}
          </Text>
        </View>
      </View>
      <Text style={styles.cardLocation} numberOfLines={1}>{booking.location}</Text>
      {booking.goalkeeper && (
        <Text style={styles.cardGoalkeeper}>Goalkeeper: {booking.goalkeeper.name}</Text>
      )}
      <Text style={styles.cardAmount}>€{((booking.totalAmount ?? 0) / 100).toFixed(2)}</Text>
    </TouchableOpacity>
  )
}

export default function OrganizerDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()

  const { data: bookings, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['organizer-bookings'],
    queryFn: () => apiClient.getBookings(),
  })

  const activeBookings = bookings?.filter((b) => ['PENDING', 'ACCEPTED', 'CONFIRMED'].includes(b.status)) ?? []
  const recentBookings = bookings?.slice(0, 5) ?? []

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a3e635" />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.subgreeting}>Ready to find your goalkeeper?</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeBookings.length}</Text>
          <Text style={styles.statLabel}>Active Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{bookings?.filter((b) => b.status === 'COMPLETED').length ?? 0}</Text>
          <Text style={styles.statLabel}>Matches Played</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(organizer)/search')}>
        <Text style={styles.ctaText}>Find My Keeper →</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Bookings</Text>

      {isLoading ? (
        <ActivityIndicator color="#a3e635" style={{ marginTop: 32 }} />
      ) : recentBookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⚽</Text>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>Book a goalkeeper for your next match!</Text>
        </View>
      ) : (
        recentBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onPress={() => router.push({ pathname: '/(organizer)/pay/[bookingId]', params: { bookingId: booking.id } })}
          />
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  subgreeting: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#1f2937', borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#374151',
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#a3e635' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  ctaButton: {
    backgroundColor: '#a3e635', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginBottom: 28,
  },
  ctaText: { color: '#111827', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 12 },
  card: {
    backgroundColor: '#1f2937', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#374151',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#d1d5db' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardLocation: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },
  cardGoalkeeper: { fontSize: 14, color: '#d1d5db', marginBottom: 4 },
  cardAmount: { fontSize: 16, fontWeight: '700', color: '#a3e635' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
})
