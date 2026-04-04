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

const FIELD_TYPES = ['Natural grass', 'Artificial turf', 'Indoor', 'Sand']

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
      Alert.alert('Required', 'Please enter the match location.')
      return
    }
    if (date < new Date()) {
      Alert.alert('Invalid Date', 'Please select a future date.')
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
      Alert.alert('Booking Sent!', 'Your request has been sent. Waiting for goalkeeper confirmation.', [
        {
          text: 'OK',
          onPress: () =>
            router.replace({ pathname: '/(organizer)/pay/[bookingId]', params: { bookingId: booking.id } }),
        },
      ])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create booking.'
      Alert.alert('Error', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingGk) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator color="#a3e635" size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.goalkeeperCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{gk?.user?.name?.charAt(0) ?? '?'}</Text>
        </View>
        <View>
          <Text style={styles.goalkeeperName}>{gk?.user?.name}</Text>
          <Text style={styles.goalkeeperCity}>{gk?.city}</Text>
          <Text style={styles.goalkeeperRating}>⭐ {gk?.averageRating.toFixed(1)} · {gk?.totalMatches} matches</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Booking Details</Text>

      <Text style={styles.label}>Date & Time</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.inputText}>
          {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
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

      <Text style={styles.label}>Match Location</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g. Sportpark Amsterdam-Noord"
        placeholderTextColor="#6b7280"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Duration (minutes)</Text>
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

      <Text style={styles.label}>Field Type</Text>
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

      <Text style={styles.label}>Special Requests (optional)</Text>
      <TextInput
        style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Any special instructions..."
        placeholderTextColor="#6b7280"
        multiline
        value={specialRequests}
        onChangeText={setSpecialRequests}
      />

      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>€{pricePerHour}/hour × {Number(duration) / 60}h</Text>
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
          <ActivityIndicator color="#111827" />
        ) : (
          <Text style={styles.buttonText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { padding: 20, paddingBottom: 40 },
  goalkeeperCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a3e635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#111827', fontSize: 22, fontWeight: '700' },
  goalkeeperName: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  goalkeeperCity: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  goalkeeperRating: { fontSize: 13, color: '#d1d5db', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#d1d5db', marginBottom: 8 },
  input: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  inputText: { fontSize: 15, color: '#ffffff' },
  textInput: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 16,
  },
  durationRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  durationBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  durationBtnActive: { borderColor: '#a3e635', backgroundColor: '#1a2410' },
  durationText: { fontSize: 14, fontWeight: '500', color: '#9ca3af' },
  durationTextActive: { color: '#a3e635', fontWeight: '700' },
  fieldChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
    marginRight: 8,
  },
  fieldChipActive: { borderColor: '#a3e635', backgroundColor: '#1a2410' },
  fieldChipText: { fontSize: 13, color: '#9ca3af' },
  fieldChipTextActive: { color: '#a3e635', fontWeight: '600' },
  priceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, color: '#9ca3af' },
  priceValue: { fontSize: 14, color: '#d1d5db' },
  divider: { height: 1, backgroundColor: '#374151', marginVertical: 12 },
  priceTotalLabel: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  priceTotalValue: { fontSize: 20, fontWeight: '800', color: '#a3e635' },
  button: {
    backgroundColor: '#a3e635',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#111827', fontSize: 16, fontWeight: '700' },
})
