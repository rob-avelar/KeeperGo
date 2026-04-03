import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Home, Search, Bell, User } from 'lucide-react-native'

export default function OrganizerLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a56db',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#fff',
          borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: isDark ? '#111827' : '#fff',
        },
        headerTintColor: isDark ? '#fff' : '#111827',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Conta',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      {/* Telas ocultas das tabs */}
      <Tabs.Screen name="book/[goalkeeperId]" options={{ href: null }} />
      <Tabs.Screen name="pay/[bookingId]" options={{ href: null }} />
    </Tabs>
  )
}
