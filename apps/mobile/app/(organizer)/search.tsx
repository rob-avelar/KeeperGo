import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
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
          <Text style={styles.cardCity}>{gk.city ?? 'Cidade não informada'}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardRating}>⭐ {gk.averageRating.toFixed(1)}</Text>
            <Text style={styles.cardMatches}>{gk.totalMatches} jogos</Text>
          </View>
        </View>
        <View style={styles.cardPrice}>
          <Text style={styles.priceValue}>€{gk.hourlyRateMin}</Text>
          <Text style={styles.priceLabel}>/hora</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function SearchScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
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
      {/* Barra de pesquisa */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cidade..."
          placeholderTextColor="#9ca3af"
          value={searchCity}
          onChangeText={setSearchCity}
        />
      </View>

      {/* Toggle lista/mapa */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            Lista
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            Mapa
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#1a56db" style={{ flex: 1 }} />
      ) : viewMode === 'map' ? (
        <MapView
          style={styles.map}
          region={
            coords
              ? {
                  latitude: coords.lat,
                  longitude: coords.lng,
                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                }
              : {
                  latitude: 52.3676,
                  longitude: 4.9041,
                  latitudeDelta: 1,
                  longitudeDelta: 1,
                }
          }
          showsUserLocation
        >
          {goalkeepers
            ?.filter((gk) => gk.latitude && gk.longitude)
            .map((gk) => (
              <Marker
                key={gk.id}
                coordinate={{ latitude: gk.latitude!, longitude: gk.longitude! }}
                title={gk.user?.name}
                description={`⭐ ${gk.averageRating.toFixed(1)} · €${gk.hourlyRateMin}/h`}
                onCalloutPress={() => goToProfile(gk.id)}
              />
            ))}
        </MapView>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {goalkeepers?.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum goleiro encontrado.</Text>
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchBar: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  toggle: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#fff' },
  toggleText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  toggleTextActive: { color: '#111827', fontWeight: '700' },
  map: { flex: 1 },
  list: { padding: 12, paddingBottom: 40 },
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
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a56db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardCity: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cardRating: { fontSize: 13, color: '#374151' },
  cardMatches: { fontSize: 13, color: '#374151' },
  cardPrice: { alignItems: 'flex-end' },
  priceValue: { fontSize: 18, fontWeight: '800', color: '#1a56db' },
  priceLabel: { fontSize: 12, color: '#6b7280' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#6b7280' },
})
