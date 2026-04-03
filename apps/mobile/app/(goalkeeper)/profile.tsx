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

const EXPERIENCE_LEVELS = ['Iniciante', 'Amador', 'Semi-profissional', 'Profissional']
const FIELD_TYPES = ['Grama natural', 'Grama sintética', 'Quadra coberta', 'Areia']

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
      Alert.alert('Sucesso', 'Perfil atualizado!')
    },
    onError: (err) => Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar.'),
  })

  function toggleField(field: string) {
    setPreferredFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1a56db" size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status ativo */}
      <View style={styles.activeRow}>
        <View>
          <Text style={styles.activeLabel}>Disponível para reservas</Text>
          <Text style={styles.activeSubtext}>
            {isActive ? 'Você aparece nas buscas' : 'Você está invisível para organizadores'}
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ true: '#1a56db', false: '#e5e7eb' }}
          thumbColor="#fff"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>⭐ {profile?.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avaliação</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.totalMatches}</Text>
          <Text style={styles.statLabel}>Jogos</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Sobre você</Text>

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        placeholder="Fale um pouco sobre você, sua experiência..."
        placeholderTextColor="#9ca3af"
        multiline
        value={bio}
        onChangeText={setBio}
      />

      <Text style={styles.label}>Cidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Amsterdam"
        placeholderTextColor="#9ca3af"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>Nível de experiência</Text>
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

      <Text style={styles.label}>Tipos de campo preferidos</Text>
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

      <Text style={styles.sectionTitle}>Tarifas e disponibilidade</Text>

      <View style={styles.rateRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Taxa mín (€/h)</Text>
          <TextInput
            style={styles.input}
            placeholder="15"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={hourlyRateMin}
            onChangeText={setHourlyRateMin}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Taxa máx (€/h)</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={hourlyRateMax}
            onChangeText={setHourlyRateMax}
          />
        </View>
      </View>

      <Text style={styles.label}>Raio de deslocamento (km)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 25"
        placeholderTextColor="#9ca3af"
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
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar perfil</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  activeSubtext: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
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
  statNumber: { fontSize: 20, fontWeight: '800', color: '#1a56db' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  chipActive: { borderColor: '#1a56db', backgroundColor: '#eff6ff' },
  chipText: { fontSize: 13, color: '#6b7280' },
  chipTextActive: { color: '#1a56db', fontWeight: '600' },
  rateRow: { flexDirection: 'row', gap: 12 },
  saveButton: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
