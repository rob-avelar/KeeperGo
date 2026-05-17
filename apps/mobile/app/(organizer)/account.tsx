import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/lib/auth-store'

export default function AccountScreen() {
  const { user, signOut } = useAuthStore()
  const router = useRouter()

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Organizer</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem label="My Bookings" onPress={() => router.push('/(organizer)/dashboard')} />
        <MenuItem label="Notifications" onPress={() => router.push('/(organizer)/notifications')} />
        <MenuItem label="Favourite Goalkeepers" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <MenuItem label="Contact Us" onPress={() => Linking.openURL('mailto:contact@keepergo.nl')} />
        <MenuItem label="Privacy Policy" onPress={() => Linking.openURL('https://keepergo.nl/privacy')} />
        <MenuItem label="Terms of Service" onPress={() => Linking.openURL('https://keepergo.nl/terms')} />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>KeeperGo v1.0.0 · #1 Goalkeeper Platform in Netherlands</Text>
    </ScrollView>
  )
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { paddingBottom: 40 },
  profile: { alignItems: 'center', padding: 32, backgroundColor: '#1f2937', marginBottom: 12 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#a3e635',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  avatarText: { color: '#111827', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  email: { fontSize: 14, color: '#9ca3af', marginBottom: 12 },
  roleBadge: { backgroundColor: '#1a2410', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#a3e635' },
  roleText: { fontSize: 13, color: '#a3e635', fontWeight: '600' },
  section: { backgroundColor: '#1f2937', marginBottom: 12 },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: '#6b7280', paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#374151',
  },
  menuLabel: { fontSize: 15, color: '#ffffff' },
  menuArrow: { fontSize: 20, color: '#6b7280' },
  signOutButton: { margin: 20, backgroundColor: '#1f2937', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  signOutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 8 },
})
