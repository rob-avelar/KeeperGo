import { StripeProvider } from '@stripe/stripe-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '@/lib/auth-store'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

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

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      if (user.role === 'ORGANIZER') {
        router.replace('/(organizer)/dashboard')
      } else if (user.role === 'GOALKEEPER') {
        router.replace('/(goalkeeper)/dashboard')
      }
    }
  }, [user, isLoading, segments])

  return <Slot />
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider
          publishableKey={STRIPE_KEY}
          merchantIdentifier="merchant.nl.keepergo"
          urlScheme="keepergo"
        >
          <QueryClientProvider client={queryClient}>
            <AuthGate />
          </QueryClientProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
