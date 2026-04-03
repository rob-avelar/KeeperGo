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
          {date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>Nova solicitação</Text>
        </View>
      </View>
      <Text style={styles.cardOrganizer}>Organizador: {booking.organizer.name}</Text>
      <Text style={styles.cardLocation} numberOfLines={1}>{booking.location}</Text>
      <Text style={styles.cardDuration}>{booking.duration} minutos · €{booking.goalkeeperEarnings.toFixed(2)}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
          <Text style={styles.rejectBtnText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={onAccept}>
          <Text style={styles.acceptBtnText}>Aceitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const date = new Date(booking.date)
  const statusColors: Record<string, string> = {
    ACCEPTED: '#3b82f6',
    CONFIRMED: '#10b981',
    COMPLETED: '#6b7280',
    CANCELLED: '#ef4444',
  }
  const statusLabels: Record<string, string> = {
    ACCEPTED: 'Aceito',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
  }
  const color = statusColors[booking.status] ?? '#6b7280'
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.statusText, { color }]}>{statusLabels[booking.status] ?? booking.status}</Text>
        </View>
      </View>
      <Text style={styles.cardLocation} numberOfLines={1}>{booking.location}</Text>
      <Text style={styles.cardEarnings}>Ganho: €{booking.goalkeeperEarnings.toFixed(2)}</Text>
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
    onError: (err) => Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao aceitar.'),
  })

  const { mutate: reject } = useMutation({
    mutationFn: (id: string) => apiClient.rejectBooking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalkeeper-bookings'] }),
    onError: (err) => Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao recusar.'),
  })

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') ?? []
  const activeBookings = bookings?.filter((b) => ['ACCEPTED', 'CONFIRMED'].includes(b.status)) ?? []
  const completedCount = bookings?.filter((b) => b.status === 'COMPLETED').length ?? 0
  const totalEarned = bookings
    ?.filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.goalkeeperEarnings, 0) ?? 0

  function handleAccept(id: string) {
    Alert.alert('Aceitar reserva?', 'Você se compromete a aparecer no jogo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceitar', onPress: () => accept(id) },
    ])
  }

  function handleReject(id: string) {
    Alert.alert('Recusar reserva?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Recusar', style: 'destructive', onPress: () => reject(id) },
    ])
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 🧤</Text>
        <Text style={styles.subgreeting}>Aqui estão seus jogos</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Jogos feitos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>€{totalEarned.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total ganho</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingBookings.length}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#1a56db" style={{ marginTop: 32 }} />
      ) : (
        <>
          {/* Solicitações pendentes */}
          {pendingBookings.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>⚡ Solicitações pendentes</Text>
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

          {/* Jogos ativos */}
          {activeBookings.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>📅 Próximos jogos</Text>
              {activeBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
            </>
          )}

          {/* Estado vazio */}
          {pendingBookings.length === 0 && activeBookings.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧤</Text>
              <Text style={styles.emptyText}>Nenhuma reserva no momento.</Text>
              <Text style={styles.emptySubtext}>Complete seu perfil para aparecer nas buscas!</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subgreeting: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#1a56db' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
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
  pendingBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  pendingBadgeText: { fontSize: 12, color: '#d97706', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardOrganizer: { fontSize: 14, color: '#374151', marginBottom: 4 },
  cardLocation: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  cardDuration: { fontSize: 14, fontWeight: '600', color: '#1a56db', marginBottom: 12 },
  cardEarnings: { fontSize: 14, fontWeight: '600', color: '#10b981' },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#1a56db' },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  rejectBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
})
