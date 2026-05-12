import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import * as Location from 'expo-location'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { apiClient } from '@/lib/api'
import type { GoalkeeperProfile } from '@keepergo/shared-types'

function GoalkeeperCard({ gk, onPress }: { gk: GoalkeeperProfile; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {gk.user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{gk.user?.name}</Text>
          <Text style={styles.cardCity}>{gk.city ?? 'City not specified'}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardRating}>⭐ {(gk.averageRating ?? 0).toFixed(1)}</Text>
            <Text style={styles.cardMatches}>{gk.totalMatches} matches</Text>
          </View>
        </View>
        <View style={styles.cardPrice}>
          <Text style={styles.priceValue}>€{gk.hourlyRateMin}</Text>
          <Text style={styles.priceLabel}>/hour</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function SearchScreen() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [searchCity, setSearchCity] = useState('')
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({})
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })
      }
    })()
  }, [])

  const { data: goalkeepers, isLoading } = useQuery({
    queryKey: ['goalkeepers', coords, searchCity],
    queryFn: () =>
      apiClient.searchGoalkeepers({
        lat: coords?.lat,
        lng: coords?.lng,
        radius: 50,
        city: searchCity || undefined,
      }),
  })

  function goToProfile(id: string) {
    router.push({ pathname: '/(organizer)/book/[goalkeeperId]', params: { goalkeeperId: id } })
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city..."
          placeholderTextColor="#6b7280"
          value={searchCity}
          onChangeText={setSearchCity}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#a3e635" style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {goalkeepers?.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧤</Text>
              <Text style={styles.emptyTitle}>No goalkeepers found</Text>
              <Text style={styles.emptyText}>Try a different city or expand your search area.</Text>
            </View>
          ) : (
            goalkeepers?.map((gk) => (
              <GoalkeeperCard key={gk.id} gk={gk} onPress={() => goToProfile(gk.id)} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  searchBar: { padding: 16, backgroundColor: '#1f2937', borderBottomWidth: 1, borderBottomColor: '#374151' },
  searchInput: {
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#ffffff',
  },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#a3e635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#111827', fontSize: 20, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  cardCity: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cardRating: { fontSize: 13, color: '#d1d5db' },
  cardMatches: { fontSize: 13, color: '#d1d5db' },
  cardPrice: { alignItems: 'flex-end' },
  priceValue: { fontSize: 18, fontWeight: '800', color: '#a3e635' },
  priceLabel: { fontSize: 12, color: '#9ca3af' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
})
