import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

const EXPERIENCE_LEVELS = ['Beginner', 'Amateur', 'Semi-professional', 'Professional']
const FIELD_TYPES = ['Natural grass', 'Artificial turf', 'Indoor', 'Sand']

export default function ProfileScreen() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['goalkeeper-profile'],
    queryFn: () => apiClient.getGoalkeeperProfile(),
  })

  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [hourlyRateMin, setHourlyRateMin] = useState('')
  const [hourlyRateMax, setHourlyRateMax] = useState('')
  const [serviceRadius, setServiceRadius] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [preferredFields, setPreferredFields] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '')
      setCity(profile.city ?? '')
      setHourlyRateMin(String(profile.hourlyRateMin))
      setHourlyRateMax(String(profile.hourlyRateMax))
      setServiceRadius(String(profile.serviceRadius))
      setExperienceLevel(profile.experienceLevel ?? '')
      setPreferredFields(profile.preferredFields)
      setIsActive(profile.isActive)
    }
  }, [profile])

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: () =>
      apiClient.updateGoalkeeperProfile({
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        hourlyRateMin: Number(hourlyRateMin),
        hourlyRateMax: Number(hourlyRateMax),
        serviceRadius: Number(serviceRadius),
        experienceLevel: experienceLevel || undefined,
        preferredFields,
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalkeeper-profile'] })
      Alert.alert('Saved', 'Profile updated successfully!')
    },
    onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save.'),
  })

  function toggleField(field: string) {
    setPreferredFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator color="#a3e635" size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.activeRow}>
        <View>
          <Text style={styles.activeLabel}>Available for bookings</Text>
          <Text style={styles.activeSubtext}>
            {isActive ? 'You appear in search results' : 'You are hidden from organizers'}
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ true: '#a3e635', false: '#374151' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>⭐ {profile?.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.totalMatches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>About You</Text>

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        placeholder="Tell us about yourself and your experience..."
        placeholderTextColor="#6b7280"
        multiline
        value={bio}
        onChangeText={setBio}
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Amsterdam"
        placeholderTextColor="#6b7280"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>Experience Level</Text>
      <View style={styles.chipRow}>
        {EXPERIENCE_LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.chip, experienceLevel === level && styles.chipActive]}
            onPress={() => setExperienceLevel(level)}
          >
            <Text style={[styles.chipText, experienceLevel === level && styles.chipTextActive]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Preferred Field Types</Text>
      <View style={styles.chipRow}>
        {FIELD_TYPES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, preferredFields.includes(f) && styles.chipActive]}
            onPress={() => toggleField(f)}
          >
            <Text style={[styles.chipText, preferredFields.includes(f) && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Rates & Availability</Text>

      <View style={styles.rateRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Min rate (€/h)</Text>
          <TextInput
            style={styles.input}
            placeholder="15"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
            value={hourlyRateMin}
            onChangeText={setHourlyRateMin}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Max rate (€/h)</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
            value={hourlyRateMax}
            onChangeText={setHourlyRateMax}
          />
        </View>
      </View>

      <Text style={styles.label}>Travel radius (km)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 25"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
        value={serviceRadius}
        onChangeText={setServiceRadius}
      />

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={() => saveProfile()}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#111827" />
        ) : (
          <Text style={styles.saveButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { padding: 20, paddingBottom: 40 },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activeLabel: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  activeSubtext: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#a3e635' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 12, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '500', color: '#d1d5db', marginBottom: 8 },
  input: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
  },
  chipActive: { borderColor: '#a3e635', backgroundColor: '#1a2410' },
  chipText: { fontSize: 13, color: '#9ca3af' },
  chipTextActive: { color: '#a3e635', fontWeight: '600' },
  rateRow: { flexDirection: 'row', gap: 12 },
  saveButton: {
    backgroundColor: '#a3e635',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#111827', fontSize: 16, fontWeight: '700' },
})
