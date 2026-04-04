import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Notification } from '@/lib/packages/shared-types'

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
          {new Date(item.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
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
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
      <ActivityIndicator color="#a3e635" size="large" />
    </View>
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
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyText}>You're all caught up!</Text>
        </View>
      }
      contentContainerStyle={{ flexGrow: 1 }}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  item: { flexDirection: 'row', backgroundColor: '#1f2937', padding: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  itemUnread: { backgroundColor: '#1a2410', borderLeftWidth: 3, borderLeftColor: '#a3e635' },
  itemDot: { width: 20, alignItems: 'center', paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#a3e635' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  itemMessage: { fontSize: 14, color: '#9ca3af', lineHeight: 20, marginBottom: 6 },
  itemTime: { fontSize: 12, color: '#6b7280' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
})
