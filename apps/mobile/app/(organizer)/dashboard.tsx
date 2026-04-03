import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { Booking } from '@keepergo/shared-types'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando',
  ACCEPTED: 'Aceito',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rejeitado',
  NO_SHOW: 'Não compareceu',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  ACCEPTED: '#3b82f6',
  CONFIRMED: '#10b981',
  COMPLETED: '#6b7280',
  CANCELLED: '#ef4444',
  REJECTED: '#ef4444',
  NO_SHOW: '#7c3aed',
}

function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const date = new Date(booking.date)
  const statusColor = STATUS_COLORS[booking.status] ?? '#6b7280'
  const statusLabel = STATUS_LABELS[booking.status] ?? booking.status

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={styles.cardLocation} numberOfLines={1}>{booking.location}</Text>
      {booking.goalkeeper && (
        <Text style={styles.cardGoalkeeper}>Goleiro: {booking.goalkeeper.name}</Text>
      )}
      <Text style={styles.cardAmount}>€{booking.totalAmount.toFixed(2)}</Text>
    </TouchableOpacity>
  )
}

export default function OrganizerDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()

  const {
    data: bookings,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['organizer-bookings'],
    queryFn: () => apiClient.getBookings(),
  })

  const activeBookings = bookings?.filter((b) =>
    ['PENDING', 'ACCEPTED', 'CONFIRMED'].includes(b.status),
  ) ?? []

  const recentBookings = bookings?.slice(0, 5) ?? []

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.subgreeting}>Pronto para organizar seu próximo jogo?</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeBookings.length}</Text>
          <Text style={styles.statLabel}>Reservas ativas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{bookings?.filter((b) => b.status === 'COMPLETED').length ?? 0}</Text>
          <Text style={styles.statLabel}>Jogos concluídos</Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(organizer)/search')}>
        <Text style={styles.ctaText}>+ Contratar goleiro</Text>
      </TouchableOpacity>

      {/* Reservas recentes */}
      <Text style={styles.sectionTitle}>Reservas recentes</Text>

      {isLoading ? (
        <ActivityIndicator color="#1a56db" style={{ marginTop: 32 }} />
      ) : recentBookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⚽</Text>
          <Text style={styles.emptyText}>Nenhuma reserva ainda.</Text>
          <Text style={styles.emptySubtext}>Busque um goleiro para seu próximo jogo!</Text>
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subgreeting: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#1a56db' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  ctaButton: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#374151' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardLocation: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  cardGoalkeeper: { fontSize: 14, color: '#374151', marginBottom: 4 },
  cardAmount: { fontSize: 16, fontWeight: '700', color: '#1a56db' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6b7280' },
})
