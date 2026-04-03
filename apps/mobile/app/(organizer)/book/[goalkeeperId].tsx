import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import DateTimePicker from '@react-native-community/datetimepicker'
import { apiClient } from '@/lib/api'

const FIELD_TYPES = ['Grama natural', 'Grama sintética', 'Quadra coberta', 'Areia']

export default function BookGoalkeeperScreen() {
  const { goalkeeperId } = useLocalSearchParams<{ goalkeeperId: string }>()
  const router = useRouter()

  const { data: gk, isLoading: loadingGk } = useQuery({
    queryKey: ['goalkeeper', goalkeeperId],
    queryFn: () => apiClient.getGoalkeeperById(goalkeeperId),
  })

  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [duration, setDuration] = useState('90')
  const [location, setLocation] = useState('')
  const [fieldType, setFieldType] = useState(FIELD_TYPES[0])
  const [specialRequests, setSpecialRequests] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pricePerHour = gk?.hourlyRateMin ?? 0
  const totalAmount = ((Number(duration) / 60) * pricePerHour)

  async function handleBooking() {
    if (!location.trim()) {
      Alert.alert('Atenção', 'Informe o local do jogo.')
      return
    }
    if (date < new Date()) {
      Alert.alert('Atenção', 'A data precisa ser no futuro.')
      return
    }

    setIsSubmitting(true)
    try {
      const booking = await apiClient.createBooking({
        goalkeeperId,
        date: date.toISOString(),
        duration: Number(duration),
        location: location.trim(),
        fieldType,
        pricePerHour,
        specialRequests: specialRequests.trim() || undefined,
        bookingType: 'DIRECT',
      })
      Alert.alert('Sucesso!', 'Reserva enviada! Aguarde a confirmação do goleiro.', [
        {
          text: 'OK',
          onPress: () =>
            router.replace({ pathname: '/(organizer)/pay/[bookingId]', params: { bookingId: booking.id } }),
        },
      ])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar reserva.'
      Alert.alert('Erro', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingGk) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1a56db" size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Perfil resumido */}
      <View style={styles.goalkeeperCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{gk?.user?.name?.charAt(0) ?? '?'}</Text>
        </View>
        <View>
          <Text style={styles.goalkeeperName}>{gk?.user?.name}</Text>
          <Text style={styles.goalkeeperCity}>{gk?.city}</Text>
          <Text style={styles.goalkeeperRating}>⭐ {gk?.averageRating.toFixed(1)} · {gk?.totalMatches} jogos</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Detalhes da reserva</Text>

      {/* Data */}
      <Text style={styles.label}>Data e hora</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.inputText}>
          {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          minimumDate={new Date()}
          onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d) }}
        />
      )}

      {/* Local */}
      <Text style={styles.label}>Local do jogo</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Ex: Campo do Ajuda, Amsterdam"
        placeholderTextColor="#9ca3af"
        value={location}
        onChangeText={setLocation}
      />

      {/* Duração */}
      <Text style={styles.label}>Duração (minutos)</Text>
      <View style={styles.durationRow}>
        {['60', '90', '120'].map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
            onPress={() => setDuration(d)}
          >
            <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
              {d} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tipo de campo */}
      <Text style={styles.label}>Tipo de campo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {FIELD_TYPES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.fieldChip, fieldType === f && styles.fieldChipActive]}
            onPress={() => setFieldType(f)}
          >
            <Text style={[styles.fieldChipText, fieldType === f && styles.fieldChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Observações */}
      <Text style={styles.label}>Observações (opcional)</Text>
      <TextInput
        style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Instruções especiais..."
        placeholderTextColor="#9ca3af"
        multiline
        value={specialRequests}
        onChangeText={setSpecialRequests}
      />

      {/* Resumo de preço */}
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>€{pricePerHour}/hora × {Number(duration) / 60}h</Text>
          <Text style={styles.priceValue}>€{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceTotalLabel}>Total</Text>
          <Text style={styles.priceTotalValue}>€{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleBooking}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirmar reserva</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  goalkeeperCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a56db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  goalkeeperName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  goalkeeperCity: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  goalkeeperRating: { fontSize: 13, color: '#374151', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  inputText: { fontSize: 15, color: '#111827' },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  durationRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  durationBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  durationBtnActive: { borderColor: '#1a56db', backgroundColor: '#eff6ff' },
  durationText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  durationTextActive: { color: '#1a56db', fontWeight: '700' },
  fieldChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  fieldChipActive: { borderColor: '#1a56db', backgroundColor: '#eff6ff' },
  fieldChipText: { fontSize: 13, color: '#6b7280' },
  fieldChipTextActive: { color: '#1a56db', fontWeight: '600' },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, color: '#6b7280' },
  priceValue: { fontSize: 14, color: '#374151' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  priceTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  priceTotalValue: { fontSize: 20, fontWeight: '800', color: '#1a56db' },
  button: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
