import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Notification } from '@keepergo/shared-types'

function NotificationItem({ item, onRead }: { item: Notification; onRead: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.item, !item.isRead && styles.itemUnread]}
      onPress={onRead}
    >
      <View style={styles.itemDot}>
        {!item.isRead && <View style={styles.dot} />}
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemMessage}>{item.message}</Text>
        <Text style={styles.itemTime}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default function NotificationsScreen() {
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.getNotifications(),
  })

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1a56db" size="large" />
      </View>
    )
  }

  return (
    <FlatList
      style={styles.container}
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationItem item={item} onRead={() => !item.isRead && markRead(item.id)} />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>Nenhuma notificação</Text>
        </View>
      }
      contentContainerStyle={{ flexGrow: 1 }}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemUnread: { backgroundColor: '#eff6ff' },
  itemDot: { width: 20, alignItems: 'center', paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a56db' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  itemMessage: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
  itemTime: { fontSize: 12, color: '#9ca3af' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6b7280' },
})
