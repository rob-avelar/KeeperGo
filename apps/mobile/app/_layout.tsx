import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { Component, useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StripeProvider } from '@stripe/stripe-react-native'
import { useAuthStore } from '@/lib/auth-store'

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message + '\n' + error.stack }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#111827', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: '#a3e635', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            Erro detectado:
          </Text>
          <ScrollView>
            <Text style={{ color: '#ef4444', fontSize: 13 }}>{this.state.error}</Text>
          </ScrollView>
        </View>
      )
    }
    return this.props.children
  }
}

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function AuthGate() {
  const { user, isLoading, restoreSession } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    restoreSession()
  }, [])

  useEffect(() => {
    if (isLoading) return
    SplashScreen.hideAsync()

    const inAuthGroup = segments[0] === '(auth)'
    const inOrganizerGroup = segments[0] === '(organizer)'
    const inGoalkeeperGroup = segments[0] === '(goalkeeper)'
    const inProtectedGroup = inOrganizerGroup || inGoalkeeperGroup

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && (inAuthGroup || !inProtectedGroup)) {
      const role = user.role?.toUpperCase()
      if (role === 'ORGANIZER' || role === 'ADMIN') {
        router.replace('/(organizer)/dashboard')
      } else if (role === 'GOALKEEPER') {
        router.replace('/(goalkeeper)/dashboard')
      } else {
        router.replace('/(auth)/register-details')
      }
    }
  }, [user, isLoading, segments])

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#111827' }} />
  }

  return <Slot />
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.nl.keepergo">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <AuthGate />
            </QueryClientProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </StripeProvider>
    </ErrorBoundary>
  )
}
